import { createContext, useContext, useEffect, useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const ResponsiveDialogContext = createContext<boolean>(false);

function useIsMobile(breakpoint = 640) {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.innerWidth < breakpoint;
	});

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mql.addEventListener("change", handler);
		setIsMobile(mql.matches);
		return () => mql.removeEventListener("change", handler);
	}, [breakpoint]);

	return isMobile;
}

function ResponsiveDialog({
	children,
	...props
}: React.ComponentProps<typeof Dialog>) {
	const isMobile = useIsMobile();

	return (
		<ResponsiveDialogContext.Provider value={isMobile}>
			{isMobile ? (
				<Drawer {...props}>{children}</Drawer>
			) : (
				<Dialog {...props}>{children}</Dialog>
			)}
		</ResponsiveDialogContext.Provider>
	);
}

function ResponsiveDialogContent({
	children,
	className,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogContent> & {
	showCloseButton?: boolean;
}) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return (
			<DrawerContent
				className={cn("h-[90vh] !mt-0 !max-h-[90vh]", className)}
				{...props}
			>
				<div className="flex-1 overflow-y-auto p-6">{children}</div>
			</DrawerContent>
		);
	}

	return (
		<DialogContent
			showCloseButton={showCloseButton}
			className={className}
			{...props}
		>
			{children}
		</DialogContent>
	);
}

function ResponsiveDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return <DrawerHeader className={className} {...props} />;
	}

	return <DialogHeader className={className} {...props} />;
}

function ResponsiveDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogTitle>) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return <DrawerTitle className={className} {...props} />;
	}

	return <DialogTitle className={className} {...props} />;
}

function ResponsiveDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogDescription>) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return <DrawerDescription className={className} {...props} />;
	}

	return <DialogDescription className={className} {...props} />;
}

function ResponsiveDialogClose({
	className,
	...props
}: React.ComponentProps<typeof DialogClose>) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return <DrawerClose className={className} {...props} />;
	}

	return <DialogClose className={className} {...props} />;
}

function ResponsiveDialogTrigger({
	className,
	...props
}: React.ComponentProps<typeof DialogTrigger>) {
	const isMobile = useContext(ResponsiveDialogContext);

	if (isMobile) {
		return <DrawerTrigger className={className} {...props} />;
	}

	return <DialogTrigger className={className} {...props} />;
}

export {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogClose,
	ResponsiveDialogTrigger,
};
