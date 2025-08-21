import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ClipboardIcon, PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSubmitting(true);
    const form = e.currentTarget as HTMLFormElement;
    form.submit();
  };

  useEffect(() => {
    document.title = "cuzbangs. cuz it bangs";
  }, []);

  const handleXIydheko = () => {
    window.open("https://x.com/iydheko", "_blank");
  };

  const handleGitHubClick = () => {
    window.open("https://github.com/ferdinankurnian/cuzbangs", "_blank");
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-svh">
      <div className="absolute top-2 right-0 left-0 flex flex-row justify-center items-center p-2">
        <Popover>
          <PopoverTrigger asChild className="z-50">
            <Button variant="outline">
              <PlusCircle />
              Add to Browser
            </Button>
          </PopoverTrigger>
          <PopoverContent className="md:w-100 space-y-2 mt-2" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="relative h-48 w-[100%] overflow-hidden">
              <img src="guide.png" alt="Guide to add cuzbangs" className="object-contain w-full h-full" />
            </div>
            <div className="px-3 pb-3 space-y-4">
              <p className="text-sm">Copy this URL to add cuzbangs to your browser as default search engine.</p>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  value={import.meta.env.VITE_APP_SEARCH_URL}
                  onClick={(e) => e.currentTarget.select()}
                  spellCheck="false"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      import.meta.env.VITE_APP_SEARCH_URL,
                    );
                    toast("Copied to clipboard.");
                  }}
                >
                  <ClipboardIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="max-w-xl space-y-4">
        <h1 className="md:w-sm md:text-6xl leading-18 text-2xl mb-12 font-bold">cuzbangs. cuz it bangs.</h1>
        <form 
          action="https://cuzbangs.vercel.app/go" 
          method="get" 
          className="flex w-xl items-center space-x-2"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            size={"lg"}
            spellCheck="false"
            placeholder="Search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="iconlg"
            disabled={!searchQuery.trim() || isSubmitting}
            className={`transition-opacity ${!searchQuery.trim() ? 'opacity-50' : 'hover:opacity-90'}`}
          >
            <Search className="h-16 w-16" />
          </Button>
        </form>
        <div className="flex flex-row justify-center">
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
    </div>
  );
}

export default App;
