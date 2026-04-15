"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchEntry({
  placeholder = "搜一搜：租房、银行卡、看病、快递丢失……",
  initialValue = "",
  value,
  onValueChange,
}: {
  placeholder?: string;
  initialValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState(initialValue);
  const searchValue = value ?? internalValue;

  return (
    <form
      className="flex items-center gap-2 rounded-[1.4rem] border border-white/60 bg-background/80 p-2 shadow-[0_16px_30px_rgba(36,41,33,0.08)] backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      }}
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setInternalValue(nextValue);
            onValueChange?.(nextValue);
          }}
          placeholder={placeholder}
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="sm" className="h-10 rounded-full px-4">
        搜索
      </Button>
    </form>
  );
}
