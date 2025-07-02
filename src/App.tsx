import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function App() {
  const handleXIydheko = () => {
    window.open("https://x.com/iydheko", "_blank");
  };

  const handleGitHubClick = () => {
    window.open("https://github.com/ferdinankurnian/cuzbangs", "_blank");
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-svh px-4">
      <h1 className="md:text-4xl text-2xl font-bold">cuzbangs. cuz it bangs.</h1>
      <div className="max-w-xl text-center opacity-75">
        <p className="md:text-[1rem] text-sm">
          Tired with being forced? Search for anything you want with your
          choosen search engine. Don't like "!" mark? change it. Add this to
          your browser as default search engine. Don't forget, cuzbangs, cuz it
          bangs.
        </p>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          value="https://cuzbangs.vercel.app/go?q=%s"
          onClick={(e) => e.currentTarget.select()}
          spellCheck="false"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(
              "https://cuzbangs.vercel.app/go?q=%s",
            );
            toast("Copied to clipboard.");
          }}
        >
          <ClipboardIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-row">
        <Button variant="link" onClick={handleGitHubClick}>
          GitHub
        </Button>
        <Button variant="link" onClick={handleXIydheko}>
          Ferdinan Iydheko
        </Button>
        <Link to="/settings">
          <Button variant="link">Settings</Button>
        </Link>
      </div>
    </div>
  );
}

export default App;
