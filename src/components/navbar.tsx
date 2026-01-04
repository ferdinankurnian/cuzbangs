import { Search, Settings, Store } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Nav, NavItem } from "@/components/ui/navbar";

export const Navbar = () => {
	const { isConsented } = useApp();

	return (
		<Nav>
			<NavItem to="/" icon={<Search />} tooltip="Search" />
			<NavItem to="/store" icon={<Store />} tooltip="Store" />
			{isConsented && (
				<NavItem to="/settings" icon={<Settings />} tooltip="Settings" />
			)}
		</Nav>
	);
};
