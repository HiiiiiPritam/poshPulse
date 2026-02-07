"use client";
import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import useProductStore from "@/store/productState";
import { IProduct } from "@/models/Products";
import ScrollableRow from "./scrollableSection";


const Tabs: React.FC<{}> = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const products = useProductStore((state) => state.products);
    const [LovedProducts, setLovedProducts] = useState<IProduct[]>([]);
    const [newProducts, setNewProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("lovedddd",LovedProducts);
        console.log("newwwww",newProducts);
    }, [LovedProducts, newProducts]);


    useEffect(() => {
        const applyFilters = ({
            selectedTag,
          }: {
            selectedTag: string;
          }) => {
            const filteredLoved = products.filter((product: IProduct) => 
              product.tags?.includes(selectedTag)
            );
            setLovedProducts(filteredLoved);
            setLoading(false);
          };
         applyFilters({
            selectedTag: "Most Loved"
          });

          const sortProductsByDate = (products: IProduct[]) => {
            const sortedProducts = products.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateB - dateA; // Sort in descending order (newest first)
            });
            return sortedProducts.slice(0, 10); // Get the first 10 products
          };

          setNewProducts(sortProductsByDate(products));
        
    }, [products]);


    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="w-[100%] h-[100%] py-4 md:p-8  flex flex-col">
                {/* Tabs */}
                <div className="flex flex-col justify-center items-center ">
                    <div className="relative h-[20%] flex items-center justify-center md:mb-6  w-[80%] md:w-[50%] ">
                       
                                <div key={"1"} className="h-full w-full flex flex-col justify-center items-center">
                                    <button
                                        
                                        onClick={() => {
                                            setActiveTab(1);
                                            setCurrentIndex(0); // Reset the index on tab change
                                        }}
                                        className={`z-10 font-semibold text-lg md:text-2xl  ${activeTab === 1 ? "text-background" : "text-primary"
                                            } transition-colors`}
                                    >
                                        Most Loved
                                    </button>
                                </div>
                                {/* <span className="text-2xl mx- ">|</span> */}
                                <div key={"2"} className="h-full w-full flex flex-col justify-center items-center">
                                    <button
                                        
                                        onClick={() => {
                                            setActiveTab(2);
                                            setCurrentIndex(0); // Reset the index on tab change
                                        }}
                                        className={`z-10 font-semibold text-lg md:text-2xl  ${activeTab === 2 ? "text-background" : "text-primary"
                                            } transition-colors`}
                                    >
                                        New Arrivals
                                    </button>
                                </div>
                           
                            {/* Animated Line */}
                            <div
                                className="absolute bg-primary p-2 rounded-full transition-all duration-300 ease-in-out text-background h-10"
                                style={{
                                    width: `${100/ 2}%`,
                                    left: `${(100 / 2) * (activeTab-1)}%`,
                                }}
                            />
                    </div>

                    {/* decor line */}
                                <div className=" w-full flex justify-center items-center overflow-hidden my-2 md:my-6">
                                <svg width="1204" height="19" viewBox="0 0 1204 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary stroke-current">
                                    <path d="M0 9.55804H553.293" stroke="currentColor" />
                                    <path d="M649.899 9.55792H1203.19" stroke="currentColor" />
                                    <path d="M635.775 2.55987C631.822 2.55987 627.87 3.60557 624.357 5.5361C623.04 6.17961 621.796 6.984 620.552 7.70795C619.966 8.0297 619.6 8.75365 619.673 9.4776C619.747 11.2473 619.015 12.9365 617.697 14.0626C616.014 15.7518 613.818 16.6367 611.55 16.5562C610.598 16.4758 609.72 16.2345 608.842 15.8323C608.476 15.6714 608.037 15.591 607.671 15.7518C605.256 16.878 602.694 17.6824 600.059 18.0846C596.4 18.5672 592.814 18.4867 589.374 16.7975C587.91 16.154 586.666 15.1083 585.642 13.7409C585.202 13.1778 584.983 13.0974 584.397 13.4995C581.397 15.5105 578.03 16.9584 574.59 17.6824C570.565 18.4867 566.54 18.7281 562.661 16.9584C559.807 15.6714 557.684 13.6604 556.733 10.3624C556.22 8.67321 555.928 6.90356 556.659 5.21434C557.465 3.28381 558.855 1.83591 560.685 1.11196C564.051 -0.416373 567.418 -0.496814 570.638 1.67503C571.809 2.55986 572.761 3.76644 573.346 5.21434C573.419 5.37522 573.419 5.5361 573.273 5.69697C573.273 5.69697 573.2 5.69698 573.2 5.77742C573.053 5.9383 572.834 5.9383 572.687 5.77742C572.614 5.69698 572.541 5.61654 572.541 5.5361C571.516 3.20337 569.54 1.51416 567.198 1.1924C564.417 0.548892 561.563 1.27284 559.294 3.20337C556.952 4.97303 556.367 8.59278 557.977 11.1668C558.123 11.4081 558.343 11.6495 558.562 11.8908C560.026 13.7409 562.075 14.867 564.271 15.2692C567.711 15.7518 571.151 15.5105 574.444 14.3844C577.298 13.4995 580.006 12.1321 582.494 10.4429C583.446 9.79936 583.592 9.39717 583.373 8.19058C582.568 3.92733 585.056 0.87065 588.349 0.227139C590.691 -0.255494 593.033 0.307574 595.009 1.67503C595.668 2.15767 596.546 2.31855 597.278 1.91635C600.572 0.548893 604.085 -0.0141786 607.598 0.307577C610.598 0.548893 613.453 1.1924 616.014 3.12294C616.526 3.52513 617.039 4.00776 617.551 4.49039C617.917 4.97303 618.502 5.05347 618.942 4.65127C620.698 3.60557 622.454 2.72074 624.284 1.99679C628.236 0.388014 632.554 -0.094615 636.726 0.548896C639.507 0.870651 642.069 2.07723 644.264 4.00776C645.947 5.37522 646.899 7.62751 646.899 9.8798C646.826 11.3277 646.24 12.6952 645.289 13.7409C643.971 15.3496 642.142 16.3149 640.166 16.6367C638.409 16.878 636.653 16.4758 635.189 15.591C634.896 15.4301 634.896 15.1888 635.043 14.867C635.189 14.6257 635.409 14.5452 635.628 14.7061C636.872 15.6714 638.482 16.0736 639.946 15.7518C641.703 15.5105 643.386 14.6257 644.703 13.2582C646.606 11.2473 646.606 7.94927 644.776 5.85786C644.63 5.69698 644.411 5.45566 644.191 5.29478C642.581 4.00776 640.678 3.20338 638.702 2.96206C637.824 2.6403 636.799 2.55987 635.775 2.55987ZM586.373 12.4538C587.325 13.58 588.569 14.3039 589.886 14.7866C592.155 15.4301 594.497 15.6714 596.766 15.3496C599.474 15.0279 602.109 14.3039 604.597 13.1778C605.109 12.9365 605.109 12.9365 604.743 12.5343C604.158 11.8908 603.645 11.2473 603.06 10.6037C601.596 8.91453 600.206 7.22532 598.669 5.77742C598.303 5.37522 597.717 5.29478 597.205 5.61654C593.472 7.46663 589.96 10.1211 586.373 12.4538ZM599.035 4.81215C601.23 6.984 603.206 9.31672 605.182 11.6494C605.914 12.4538 606.061 12.5343 607.012 11.9712C610.305 10.1211 613.526 7.94926 616.673 5.93829C617.331 5.5361 617.331 5.5361 616.673 4.97303C615.282 3.92733 613.672 3.20338 611.989 2.96206C609.061 2.47943 606.134 2.55986 603.28 3.20337C601.816 3.44469 600.352 4.00776 599.035 4.81215ZM595.083 2.72074C595.009 2.6403 595.009 2.6403 595.009 2.6403C593.107 1.1924 590.691 0.548894 588.423 1.03153C585.641 1.43372 583.665 4.32952 584.031 7.3862C584.031 7.62751 584.105 7.86882 584.178 8.11014C584.397 9.15584 584.471 9.15585 585.276 8.59278C587.91 6.90356 590.545 5.1339 593.326 3.686C593.912 3.36425 594.497 3.0425 595.083 2.72074ZM609.208 15.1083C609.5 15.2692 609.72 15.3496 609.866 15.4301C612.794 16.2345 615.868 15.1888 617.844 12.6952C618.649 11.6495 619.015 10.3624 618.942 8.99497C615.721 11.0059 612.647 13.1778 609.208 15.1083Z" fill="currentColor" />
                                </svg>
                            </div>

                </div>

                {/* Content */}
                <div className="relative overflow-hidden w-full">
                    {
                        activeTab === 1 ? <ScrollableRow title={"Most Loved"} products={LovedProducts} /> : <ScrollableRow title={"New Arrivals"} products={newProducts} />
                    }
                </div>
            </div>
        </div>
    );
};

export default Tabs;