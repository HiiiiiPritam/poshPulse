import React from "react";

interface SkeletonProps {
  type: "card" | "filter" | "panel";
}

const Skeleton: React.FC<SkeletonProps> = ({ type }) => {
  let skeletonClasses = "";

  switch (type) {
    case "card":
      skeletonClasses = "h-80 w-full bg-gray-300 rounded shadow animate-pulse";
      break;
    case "filter":
      skeletonClasses = "h-80 w-full bg-gray-200 rounded shadow animate-pulse";
      break;
    case "panel":
      skeletonClasses = "h-60 w-full bg-gray-200 rounded shadow animate-pulse";
      break;
    default:
      skeletonClasses = "h-40 w-full bg-gray-200 rounded shadow animate-pulse";
  }

  return <div className={skeletonClasses}></div>;
};

export default Skeleton;
