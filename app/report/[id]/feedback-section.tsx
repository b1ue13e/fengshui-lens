"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Send, CheckCircle2 } from "lucide-react";

interface FeedbackSectionProps {
  reportId: string;
}

export function FeedbackSection({ reportId }: FeedbackSectionProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [inaccuracy, setInaccuracy] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // 本地存储反馈
    const feedback = {
      reportId,
      helpful,
      inaccuracy: inaccuracy.trim(),
      timestamp: new Date().toISOString(),
    };
    
    // 保存到 localStorage
    const existing = JSON.parse(localStorage.getItem("spacerisk_feedback") || "[]");
    existing.push(feedback);
    localStorage.setItem("spacerisk_feedback", JSON.stringify(existing));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-stone-700 font-medium">感谢你的反馈！</p>
          <p className="text-sm text-stone-500 mt-1">这能帮助我们改进评估准确度</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardContent className="p-5">
        <h3 className="font-medium text-stone-900 mb-4">这个判断对你有帮助吗？</h3>
        
        {/* 有帮助/无帮助按钮 */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setHelpful(true)}
            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
              helpful === true
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <ThumbsUp className={`h-5 w-5 mx-auto mb-1 ${helpful === true ? "text-emerald-600" : "text-stone-500"}`} />
            <span className={`text-sm ${helpful === true ? "text-emerald-700" : "text-stone-600"}`}>有帮助</span>
          </button>
          <button
            onClick={() => setHelpful(false)}
            className={`flex-1 p-3 rounded-xl border-2 transition-all ${
              helpful === false
                ? "border-red-500 bg-red-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <ThumbsDown className={`h-5 w-5 mx-auto mb-1 ${helpful === false ? "text-red-600" : "text-stone-500"}`} />
            <span className={`text-sm ${helpful === false ? "text-red-700" : "text-stone-600"}`}>没帮助</span>
          </button>
        </div>

        {/* 详细反馈（可选） */}
        {helpful !== null && (
          <div className="space-y-3">
            <p className="text-sm text-stone-600">
              {helpful === false 
                ? "你觉得哪里最不准？（选填）" 
                : "还有什么想告诉我们的？（选填）"}
            </p>
            <textarea
              value={inaccuracy}
              onChange={(e) => setInaccuracy(e.target.value)}
              placeholder={helpful === false 
                ? "例如：系统说噪音不大，但实际很吵..." 
                : "任何建议都可以告诉我们..."}
              className="w-full p-3 rounded-lg border border-stone-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-200"
              rows={3}
            />
            <Button 
              onClick={handleSubmit}
              className="w-full"
              variant={helpful === false ? "default" : "outline"}
            >
              <Send className="h-4 w-4 mr-2" />
              提交反馈
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
