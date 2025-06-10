import {
  OptionCard,
  OptionCardHeader,
  OptionCardTitleArea,
  OptionCardTitle,
  OptionCardDescription,
  OptionCardContent,
} from "@/components/OptionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function CustomBangs() {
  return (
    <OptionCard>
      <OptionCardHeader>
        <OptionCardTitleArea>
          <OptionCardTitle>Custom bangs</OptionCardTitle>
          <OptionCardDescription>
            Add your own custom bangs to extend more webpages. These custom
            bangs will take priority over DuckDuckGo bangs when bangs call are
            same. Remember not adding exclamation mark "!" to bangs call,
            because it can be enabled or disabled.
          </OptionCardDescription>
        </OptionCardTitleArea>
      </OptionCardHeader>
      <OptionCardContent className="flex flex-row gap-3">
        <div className="w-[15rem] border rounded-md p-3 flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2 bg-neutral-800 p-2 px-3 rounded-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 258 199"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M165.735 25.0701L188.947 0.972412H0.465994V25.0701H165.735Z"
                fill="#e2e8f0"
              />
              <path
                d="M163.981 96.3239L254.022 3.68314L221.206 3.68295L145.617 80.7609L163.981 96.3239Z"
                fill="#e2e8f0"
              />
              <path
                d="M233.658 131.418C233.658 155.075 214.48 174.254 190.823 174.254C171.715 174.254 155.513 161.738 150 144.439L146.625 133.848L127.329 153.143L129.092 157.336C139.215 181.421 163.034 198.354 190.823 198.354C227.791 198.354 257.759 168.386 257.759 131.418C257.759 106.937 244.399 85.7396 224.956 74.0905L220.395 71.3582L202.727 89.2528L210.788 93.5083C224.403 100.696 233.658 114.981 233.658 131.418Z"
                fill="#e2e8f0"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M88.2625 192.669L88.2626 45.6459H64.1648L64.1648 192.669H88.2625Z"
                fill="#e2e8f0"
              />
            </svg>
            <h1>T3 Chat</h1>
          </div>
          <Button variant={"ghost"} size={"sm"} className="w-fit mx-auto">
            <Plus /> Add Bangs
          </Button>
        </div>
        <div className="flex flex-col gap-4 border grow rounded-md p-3 pt-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Bangs name</Label>
            <Input type="text" id="bangsname" placeholder="Bangs name" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Bangs call</Label>
            <Input type="text" id="bangscall" placeholder="Bangs call" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">URL</Label>
            <Input type="text" id="url" placeholder="URL" />
          </div>
          <Button className="w-fit">Save</Button>
        </div>
      </OptionCardContent>
    </OptionCard>
  );
}
