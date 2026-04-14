import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface ScrapedData {
  title: string;
  price: string;
  floorInfo: string;
  areaInfo: string;
  tags: string[];
  orientation: string;
  layout?: string;
  hasElevator?: boolean;
  buildingAge?: string;
}

function firstNonEmpty(values: Array<string | undefined>): string {
  return values.find((value) => value && value.trim())?.trim() ?? '';
}

function stripLabel(value: string, pattern: RegExp): string {
  return value.replace(pattern, '').trim();
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function addTag(target: string[], tag: string) {
  if (tag && !target.includes(tag)) {
    target.push(tag);
  }
}

function applyCandidateFallback(scrapedData: ScrapedData, $: cheerio.CheerioAPI) {
  const candidates: Array<{ text: string; score: number }> = [];

  $('a, article, div, li').each((_, element) => {
    const text = normalizeText($(element).text());
    if (!text || text.length < 18 || text.length > 220) return;

    let score = 0;
    if (/元\/月/.test(text)) score += 3;
    if (/\d+(?:\.\d+)?\s*(?:㎡|m²|平米|sqm)/i.test(text)) score += 3;
    if (/[一二三四五六七八九十0-9]+室/.test(text)) score += 2;
    if (/(南北|东南|东北|西南|西北|南\/北|东\/西|朝南|朝北|朝东|朝西)/.test(text)) score += 1;
    if (text.includes('广告')) score -= 2;

    if (score >= 4) {
      candidates.push({ text, score });
    }
  });

  const topCandidate = candidates.sort((a, b) => b.score - a.score)[0]?.text;
  if (!topCandidate) return;

  if (!scrapedData.title || scrapedData.title === 'Unknown listing') {
    const titleCandidate =
      topCandidate
        .replace(/^广告\s*/, '')
        .split(/\s+(?=(?:链家|贝壳优选|自如|曼舍|官方核验|业主自荐|新上|精装|月租|集中供暖|押一付一|\d+(?:\.\d+)?\s*(?:㎡|m²|平米|sqm)))/)[0]
        .trim() || topCandidate;
    scrapedData.title = titleCandidate;
  }

  if (!scrapedData.areaInfo) {
    const areaMatch = topCandidate.match(/\d+(?:\.\d+)?\s*(?:㎡|m²|平米|sqm)/i);
    if (areaMatch) {
      scrapedData.areaInfo = areaMatch[0];
    }
  }

  if (!scrapedData.orientation) {
    const orientationMatch = topCandidate.match(/(南北|东南|东北|西南|西北|南\/北|东\/西|东\/南|西\/南|东\/北|西\/北|朝南|朝北|朝东|朝西|[^A-Za-z]南[^A-Za-z]?|[^A-Za-z]北[^A-Za-z]?|[^A-Za-z]东[^A-Za-z]?|[^A-Za-z]西[^A-Za-z]?)/);
    if (orientationMatch) {
      scrapedData.orientation = orientationMatch[0].replace(/[^南北东西/]/g, '');
    }
  }

  if (!scrapedData.layout) {
    const layoutMatch = topCandidate.match(/([一二三四五六七八九十0-9]+室(?:[一二三四五六七八九十0-9]+厅)?)/);
    if (layoutMatch) {
      scrapedData.layout = layoutMatch[1];
    }
  }

  if (!scrapedData.price) {
    const priceMatch = topCandidate.match(/\d+(?:\.\d+)?\s*元\/月/);
    if (priceMatch) {
      scrapedData.price = priceMatch[0];
    }
  }

  if (!scrapedData.floorInfo) {
    const floorMatch = topCandidate.match(/(低楼层|中楼层|高楼层|底层|中层|高层)/);
    if (floorMatch) {
      scrapedData.floorInfo = floorMatch[1];
    }
  }

  ['近地铁', '精装', '集中供暖', '押一付一', '随时看房', '新上', '官方核验', '业主自荐'].forEach((tag) => {
    if (topCandidate.includes(tag)) {
      addTag(scrapedData.tags, tag);
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { targetUrl?: string };
    const { targetUrl } = body;

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Invalid target URL' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Upstream responded with ${response.status}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    const scrapedData: ScrapedData = {
      title: '',
      price: '',
      floorInfo: '',
      areaInfo: '',
      tags: [],
      orientation: '',
    };

    scrapedData.title = firstNonEmpty([
      $('h1').first().text(),
      $('.title').first().text(),
      $('.content__title').first().text(),
      $('title').first().text(),
    ]) || 'Unknown listing';

    scrapedData.price = firstNonEmpty([
      $('.price').first().text(),
      $('.content__aside__price').first().text(),
      $('[class*="price"]').first().text(),
    ]);

    const infoSelectors = [
      '.content__article__info ul li',
      '.baseinfo ul li',
      '.content__item__info li',
      '.house-info li',
      '.info li',
    ].join(', ');

    $(infoSelectors).each((_, element) => {
      const text = $(element).text().trim();
      if (!text) return;

      if (!scrapedData.floorInfo && /(floor|楼层|层)/i.test(text)) {
        scrapedData.floorInfo = stripLabel(text, /(楼层|floor)[:：]?\s*/i);
      }

      if (!scrapedData.areaInfo && /(面积|sqm|m²|平米)/i.test(text)) {
        scrapedData.areaInfo = stripLabel(text, /(面积|area)[:：]?\s*/i);
      }

      if (!scrapedData.orientation && /(朝向|orientation)/i.test(text)) {
        scrapedData.orientation = stripLabel(text, /(朝向|orientation)[:：]?\s*/i);
      }

      if (!scrapedData.layout && /(户型|layout|室|厅)/i.test(text)) {
        scrapedData.layout = stripLabel(text, /(户型|layout)[:：]?\s*/i);
      }

      if (!scrapedData.buildingAge && /(建造|建成年代|年代|built)/i.test(text)) {
        scrapedData.buildingAge = stripLabel(text, /(建造|建成年代|年代|built)[:：]?\s*/i);
      }

      if (/(电梯|elevator|lift)/i.test(text)) {
        const hasElevator = /(有|yes|true|配备)/i.test(text) && !/(无|no|false)/i.test(text);
        scrapedData.hasElevator = hasElevator;
      }
    });

    const tagSelectors = ['.tags span', '.content__item__tag span', '.house-tag span', '.label-list span'].join(', ');
    $(tagSelectors).each((_, element) => {
      const tag = $(element).text().trim();
      if (tag && !scrapedData.tags.includes(tag)) {
        scrapedData.tags.push(tag);
      }
    });

    if (!scrapedData.floorInfo && !scrapedData.areaInfo) {
      applyCandidateFallback(scrapedData, $);
    }

    if (!scrapedData.floorInfo && !scrapedData.areaInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not extract the key listing fields from the page.',
          details: 'The page structure may have changed or the site may be blocking scraping.',
          rawTitle: scrapedData.title,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scrapedData,
      meta: {
        source: targetUrl,
        parsedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ExtractListing] Failed to fetch or parse listing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error && error.name === 'AbortError'
          ? 'Listing fetch timed out. Please try again or switch to manual entry.'
          : 'Failed to parse the listing page. Please try manual entry instead.',
        details: error instanceof Error ? error.message : 'Unknown extraction error',
      },
      { status: 500 }
    );
  }
}
