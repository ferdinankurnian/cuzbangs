import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardIcon, PlusCircle, Search, Settings } from "lucide-react";
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
      <div className="absolute top-0 right-0 left-0 grid grid-cols-3 items-center p-2">
        <Link to="/settings" className="w-fit mr-auto">
          <Button variant="outline">
            <Settings />
            Settings
          </Button>
        </Link>
        <Popover>
          <PopoverTrigger asChild className="z-50">
            <Button variant="outline" className="w-fit mx-auto">
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
        <div className="flex flex-row gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={handleXIydheko}>
            <svg viewBox="0 0 256 209" width="256" height="209" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M256 25.45c-9.42 4.177-19.542 7-30.166 8.27 10.845-6.5 19.172-16.793 23.093-29.057a105.183 105.183 0 0 1-33.351 12.745C205.995 7.201 192.346.822 177.239.822c-29.006 0-52.523 23.516-52.523 52.52 0 4.117.465 8.125 1.36 11.97-43.65-2.191-82.35-23.1-108.255-54.876-4.52 7.757-7.11 16.78-7.11 26.404 0 18.222 9.273 34.297 23.365 43.716a52.312 52.312 0 0 1-23.79-6.57c-.003.22-.003.44-.003.661 0 25.447 18.104 46.675 42.13 51.5a52.592 52.592 0 0 1-23.718.9c6.683 20.866 26.08 36.05 49.062 36.475-17.975 14.086-40.622 22.483-65.228 22.483-4.24 0-8.42-.249-12.529-.734 23.243 14.902 50.85 23.597 80.51 23.597 96.607 0 149.434-80.031 149.434-149.435 0-2.278-.05-4.543-.152-6.795A106.748 106.748 0 0 0 256 25.45" fill="#55acee"/></svg>
          </Button>
          <Button variant="outline">
            <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="#ffff"/></svg>
            GitHub
          </Button>
        </div>
      </div>
      <div className="max-w-xl space-y-4">
        <h1 className="md:w-sm md:text-6xl leading-18 text-2xl mb-8 font-bold">cuzbangs. cuz it bangs.</h1>
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
            How cuzbangs work?
          </Button>
          <Button variant="link" onClick={handleXIydheko}>
            Bangs Lists
          </Button>
          <Button variant="link" onClick={handleXIydheko}>
            Changelogs
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
