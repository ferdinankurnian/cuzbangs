import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StoreBangsDisabledAlertProps {
	className?: string;
}

export function StoreBangsDisabledAlert({
	className,
}: StoreBangsDisabledAlertProps) {
	return (
		<Alert variant="default" className={className}>
			<AlertCircle />
			<AlertDescription className="flex items-center justify-between">
				<div>
					<AlertTitle className="text-white">Store Bangs Disabled</AlertTitle>
					<span>
						You turned off the store bangs feature. You can enable it again in
						config settings.
					</span>
				</div>
				<Link to="/settings/configs">
					<Button size="sm" className="ml-4 shrink-0">
						Go to Config <ArrowRight />
					</Button>
				</Link>
			</AlertDescription>
		</Alert>
	);
}
