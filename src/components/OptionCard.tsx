// src/components/OptionCard/index.tsx
import { type ReactNode } from "react";

// Root component
interface OptionCardProps {
  children: ReactNode;
  className?: string;
}

export function OptionCard({ children, className = "" }: OptionCardProps) {
  return (
    <div className={`flex flex-col gap-3 border rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

// Header component that contains title and action
interface OptionCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardHeader({
  children,
  className = "",
}: OptionCardHeaderProps) {
  return (
    <div
      className={`flex flex-row items-center justify-between gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

// Title area component
interface OptionCardTitleAreaProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardTitleArea({
  children,
  className = "",
}: OptionCardTitleAreaProps) {
  return <div className={`flex flex-col gap-1 ${className}`}>{children}</div>;
}

// Title component
interface OptionCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardTitle({
  children,
  className = "",
}: OptionCardTitleProps) {
  return <h1 className={`text-md font-semibold ${className}`}>{children}</h1>;
}

// Description component
interface OptionCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardDescription({
  children,
}: OptionCardDescriptionProps) {
  return children;
}

// Action area component
interface OptionCardActionProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardAction({
  children,
  className = "",
}: OptionCardActionProps) {
  return <div className={className}>{children}</div>;
}

// Content component
interface OptionCardContentProps {
  children: ReactNode;
  className?: string;
}

export function OptionCardContent({
  children,
  className = "",
}: OptionCardContentProps) {
  return <div className={className}>{children}</div>;
}
