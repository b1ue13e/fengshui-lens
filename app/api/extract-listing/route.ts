/**
 * Extract Listing API - 按需狙击式房源解析
 * 
 * 战术定位：不搞重型扫街爬虫，用户喂链接，Vercel 算力一次性精准剥离
 * 核心武器：cheerio（服务器端 jQuery）+ 伪装头（User-Agent）
 */

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// 定义我们要从网页里强行挖出来的数据结构
interface ScrapedData {
  title: string;
  price: string;
  floorInfo: string;
  areaInfo: string;
  tags: string[];
  orientation: string;
  layout?: string;        // 户型
  hasElevator?: boolean;  // 是否有电梯
  buildingAge?: string;   // 建筑年代
}

export async function POST(req: Request) {
  try {
    // 1. 接收前端传来的房源链接
    const body = await req.json();
    const { targetUrl } = body;

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: '链接格式不合法，请投喂正确的 URL' },
        { status: 400 }
      );
    }

    // 2. 伪装身份，发起突袭 (绕过最基础的防爬限制)
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      // Vercel 无服务器函数有 10s 超时，足够单次请求
    });

    if (!response.ok) {
      throw new Error(`目标服务器拒绝访问，状态码: ${response.status}`);
    }

    // 3. 获取满是泥巴的 HTML 源码
    const htmlText = await response.text();
    
    // 4. 装载进 cheerio，准备解剖
    const $ = cheerio.load(htmlText);
    const scrapedData: Partial<ScrapedData> = { tags: [] };

    // ==========================================
    // 核心解剖逻辑：多平台兼容选择器
    // 支持：链家、贝壳、自如等主流平台
    // 警告：真实 DOM 结构随时会变，需用浏览器 F12 随时校准
    // ==========================================
    
    // 提取标题 (多选择器尝试)
    scrapedData.title = 
      $('h1').first().text().trim() ||
      $('.title').first().text().trim() ||
      $('.content__title').first().text().trim() ||
      '未知标题';
    
    // 提取价格（用于展示，不用于评估）
    scrapedData.price = 
      $('.price').first().text().trim() ||
      $('.content__aside__price').first().text().trim() ||
      '';

    // 提取楼层、面积、朝向（泛用模糊匹配）
    // 链家/贝壳常用类名
    const infoSelectors = [
      '.content__article__info ul li',
      '.baseinfo ul li',
      '.content__item__info li',
      '.house-info li',
      '.info li',
    ].join(', ');

    $(infoSelectors).each((_, el) => {
      const text = $(el).text().trim();
      
      // 楼层信息：包含"楼层"、"层"字样
      if (!scrapedData.floorInfo && /楼层|层/.test(text)) {
        scrapedData.floorInfo = text.replace(/楼层[：:]?/i, '').trim();
      }
      
      // 面积信息：包含"面积"、"平米"、"㎡"
      if (!scrapedData.areaInfo && /面积|平米|㎡/.test(text)) {
        scrapedData.areaInfo = text.replace(/面积[：:]?/i, '').trim();
      }
      
      // 朝向信息：包含"朝向"
      if (!scrapedData.orientation && /朝向/.test(text)) {
        scrapedData.orientation = text.replace(/朝向[：:]?/i, '').trim();
      }
      
      // 户型信息
      if (!scrapedData.layout && /户型|室|厅/.test(text) && !scrapedData.layout) {
        scrapedData.layout = text.replace(/户型[：:]?/i, '').trim();
      }
      
      // 建筑年代
      if (!scrapedData.buildingAge && /年建|年代|建成/.test(text)) {
        scrapedData.buildingAge = text.replace(/年建|建成年代[：:]?/i, '').trim();
      }
      
      // 电梯信息
      if (/电梯/.test(text)) {
        scrapedData.hasElevator = /有/.test(text) && !/无/.test(text);
      }
    });

    // 提取标签（多选择器尝试）
    const tagSelectors = [
      '.tags span',
      '.content__item__tag span',
      '.house-tag span',
      '.label-list span',
    ].join(', ');
    
    $(tagSelectors).each((_, el) => {
      const tag = $(el).text().trim();
      if (tag && !scrapedData.tags!.includes(tag)) {
        scrapedData.tags!.push(tag);
      }
    });

    // 5. 熔断检查：如果没抓到核心字段，提前警告
    if (!scrapedData.floorInfo && !scrapedData.areaInfo) {
      return NextResponse.json({
        success: false,
        error: '无法从页面提取核心房源信息，可能遇到反爬虫或页面结构变更。',
        details: '请尝试手动输入参数，或联系开发者更新解析规则。',
        rawTitle: scrapedData.title, // 调试用
      }, { status: 422 });
    }

    // 6. 将粗加工的数据返回给客户端
    return NextResponse.json({
      success: true,
      data: scrapedData,
      meta: {
        source: targetUrl,
        parsedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    // 永远要接住异常，给前端一个体面的死法
    console.error('[ExtractListing] 抓取解析溃败:', error);
    return NextResponse.json({
      success: false,
      error: '无法穿透该房源页面，请尝试手动输入参数。',
      details: error.message,
    }, { status: 500 });
  }
}
