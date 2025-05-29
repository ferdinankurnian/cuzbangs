import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardIcon } from "lucide-react";

function App() {
  const handleXIydheko = () => {
    window.open("https://x.com/iydheko", "_blank");
  };

  const handleGitHubClick = () => {
    window.open("https://github.com/ferdinankurnian/cuzbangs", "_blank");
  };

  return (
    <>
      <div className="flex flex-col gap-3 items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">cuzbangs. cuz it bangs.</h1>
        <p className="max-w-xl text-center">
          Tired with forced? Search for anything you want with your choosen
          search engine. Don't like "!" mark? turn it off. Don't forget,
          cuzbangs, cuz it bangs.
        </p>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            value="ferdinankurnian.github.io/cuzbangs?q=%s"
            onClick={(e) => e.currentTarget.select()}
            spellCheck="false"
          />
          <Button type="submit" size="icon">
            <ClipboardIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-row">
          <Button variant="link" onClick={handleXIydheko}>
            Ferdinan Iydheko
          </Button>
          <Button variant="link" onClick={handleGitHubClick}>
            GitHub
          </Button>
          <Button variant="link">Settings</Button>
        </div>
      </div>
    </>
  );
}

export default App;
