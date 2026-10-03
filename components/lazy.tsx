"use client";
/**
 * Code-split entry points. Next.js only splits a lazily imported Client Component when the
 * `dynamic()` call itself lives in a Client Component, so Server Components import from here.
 * Each component below is still server-rendered; its JavaScript is fetched only by pages that render it.
 */
import dynamic from "next/dynamic";

export const LeadForm = dynamic(() => import("@/components/ui/LeadForm"));
export const ProcessPipeline = dynamic(() => import("@/components/sections/HomeTop").then((m) => m.ProcessPipeline));

export const IdeaConstellation = dynamic(() => import("@/components/sections/extras/IdeaConstellation"));
export const OpsDashboard = dynamic(() => import("@/components/sections/extras/OpsDashboard"));
export const ArchExplorer = dynamic(() => import("@/components/sections/extras/ArchExplorer"));
export const MvpScoper = dynamic(() => import("@/components/sections/extras/MvpScoper"));
export const PlatformToggle = dynamic(() => import("@/components/sections/extras/PlatformToggle"));
export const AssistantDemo = dynamic(() => import("@/components/sections/AssistantDemo"));
export const ScreenTour = dynamic(() => import("@/components/sections/extras/ScreenTour"));
export const ServiceExplorer = dynamic(() => import("@/components/sections/extras/ServiceExplorer"));
export const EngagementModels = dynamic(() => import("@/components/sections/extras/EngagementModels"));
export const RegionsGlobe = dynamic(() => import("@/components/sections/extras/RegionsGlobe"));
export const ConsentControls = dynamic(() => import("@/components/sections/extras/ConsentControls"));
export const PostFeedback = dynamic(() => import("@/components/sections/extras/PostFeedback"));

// Blog widgets and demos
export const DecisionTool = dynamic(() => import("@/components/mdx/Widgets").then((m) => m.DecisionTool));
export const DecisionWizard = dynamic(() => import("@/components/mdx/Widgets").then((m) => m.DecisionWizard));
export const ComplianceScore = dynamic(() => import("@/components/mdx/Widgets").then((m) => m.ComplianceScore));
export const Checklist = dynamic(() => import("@/components/mdx/Widgets").then((m) => m.Checklist));
export const CostCalculator = dynamic(() => import("@/components/mdx/Widgets").then((m) => m.CostCalculator));
export const ArchTabs = dynamic(() => import("@/components/mdx/Demos").then((m) => m.ArchTabs));
export const ChatDemo = dynamic(() => import("@/components/mdx/Demos").then((m) => m.ChatDemo));
export const DecisionHelper = dynamic(() => import("@/components/mdx/Demos").then((m) => m.DecisionHelper));
export const KeyToggle = dynamic(() => import("@/components/mdx/Demos").then((m) => m.KeyToggle));
export const StreamDemo = dynamic(() => import("@/components/mdx/Demos").then((m) => m.StreamDemo));
export const TierSelector = dynamic(() => import("@/components/mdx/Demos").then((m) => m.TierSelector));
