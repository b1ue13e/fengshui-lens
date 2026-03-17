"use client";

import { useState } from "react";
import { EngineResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Copy, Check, Volume2, Wrench, Paintbrush } from "lucide-react";
import { generateChatScripts, ChatScript } from "@/lib/llm/chat-scripts";

interface ChatSectionProps {
  report: EngineResult;
}

const scenarioConfig = {
  negotiate: { 
    label: '议价', 
    icon: Volume2,
    desc: '基于房屋问题争取合理价格'
  },
  repair: { 
    label: '维修', 
    icon: Wrench,
    desc: '要求房东解决房屋问题'
  },
  renovation: { 
    label: '改造', 
    icon: Paintbrush,
    desc: '申请允许入住后轻改造'
  },
};

const toneConfig = {
  gentle: { label: '温和协商', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  firm: { label: '现实压价', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  direct: { label: '直接指出', color: 'bg-stone-100 text-stone-800 border-stone-200' },
};

function ScriptCard({ script }: { script: ChatScript }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
      <div className="flex items-center justify-between mb-3">
        <Badge className={`text-xs ${toneConfig[script.tone].color}`}>
          {toneConfig[script.tone].label}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-green-600">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              复制
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
        {script.content}
      </p>
    </div>
  );
}

export function ChatScriptSection({ report }: ChatSectionProps) {
  const scripts = generateChatScripts(report);
  const [activeScenario, setActiveScenario] = useState<'negotiate' | 'repair' | 'renovation'>('negotiate');
  
  const scenarioScripts = scripts.filter(s => s.scenario === activeScenario);
  
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-stone-600" />
          与房东/中介沟通话术
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeScenario} 
          onValueChange={(v) => setActiveScenario(v as typeof activeScenario)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {(Object.keys(scenarioConfig) as Array<keyof typeof scenarioConfig>).map((key) => {
              const config = scenarioConfig[key];
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {(Object.keys(scenarioConfig) as Array<keyof typeof scenarioConfig>).map((scenario) => (
            <TabsContent key={scenario} value={scenario} className="space-y-3">
              <p className="text-xs text-stone-500 mb-3">
                {scenarioConfig[scenario].desc} · 三种语气版本可选
              </p>
              
              {scenarioScripts.map((script) => (
                <ScriptCard key={`${script.scenario}-${script.tone}`} script={script} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
