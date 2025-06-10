import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export default function Yeah() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Yeah!</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Heck yeah!</DialogTitle>
          <DialogDescription>
            <div className="space-y-3">
              <p>
                You found thiss! This section will be used for accepting
                donations. Please check back once I've set up my payment method.
                bc i don't have cards :) Thank you for your support!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
