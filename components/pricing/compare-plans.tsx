
import { PlansRow } from "@/types";
import { CircleCheck, Info } from "lucide-react";

import { comparePlans, plansColumns } from "@/config/subscriptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function ComparePlans() {
  const renderCell = (value: string | boolean | null) => {
    if (value === null) return "—";
    if (typeof value === "boolean")
      return value ? <CircleCheck className="size-[22px] mx-auto" /> : "—";
    return value;
  };

  return (
    <MaxWidthWrapper>
      <HeaderSection
        label="Plans"
        title="Compare Our Plans"
        subtitle="Find the perfect plan tailored for your business needs!"
      />

      <div className="my-10 md:overflow-x-visible overflow-x-scroll max-lg:mx-[-0.8rem]">
        <table className="w-full table-fixed">
          <thead>
            <tr className="divide-x divide-border border">
              <th className="sticky w-40 p-5 bg-accent md:w-1/4 lg:top-14 left-0 z-20"></th>
              {plansColumns.map((col) => (
                <th
                  key={col}
                  className="sticky w-40 p-5 bg-accent text-xl md:w-auto lg:top-14 lg:text-2xl z-10 font-heading capitalize tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-x divide-border border">
            {comparePlans.map((row: PlansRow, index: number) => (
              <tr key={index} className="divide-x divide-border border">
                <td
                  data-tip={row.tooltip ? row.tooltip : ""}
                  className="sticky bg-accent md:bg-transparent left-0"
                >
                  <div className="flex p-4 space-x-2 items-center justify-between">
                    <span className="text-[15px] lg:text-base font-medium">
                      {row.feature}
                    </span>
                    {row.tooltip && (
                      <Popover>
                        <PopoverTrigger className="p-1 rounded hover:bg-muted">
                          <Info className="size-[18px] text-muted-foreground" />
                        </PopoverTrigger>
                        <PopoverContent
                          side="top"
                          className="max-w-80 p-3 text-sm"
                        >
                          {row.tooltip}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </td>
                {plansColumns.map((col) => (
                  <td
                    key={col}
                    className="p-4 text-center text-[15px] text-muted-foreground lg:text-base"
                  >
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MaxWidthWrapper>
  );
}
