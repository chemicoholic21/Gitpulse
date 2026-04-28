"use client";

import * as React from "react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Mail, MapPin, Link as LinkIcon, Twitter, Building2, Calendar, Search, ArrowUpDown, Github, Filter, UserCheck, Linkedin, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LeaderboardEntry } from "@/lib/scoring";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SkillBreakdown } from "@/components/SkillBreakdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onHireableChange: (hireable: boolean) => void;
  onContactFilterChange: (type: "hasLinkedIn" | "hasX" | "hasEmail", value: boolean) => void;
  onSkillChange: (skill: string) => void;
  onOpenToWorkFilterChange: (value: string) => void;
  search: string;
  location: string;
  category: string;
  sortBy: string;
  sortOrder: string;
  hireable: boolean;
  hasLinkedIn: boolean;
  hasX: boolean;
  hasEmail: boolean;
  skill: string;
  openToWorkFilter: string;
  isLoading?: boolean;
}

export function LeaderboardTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onLocationChange,
  onCategoryChange,
  onSortChange,
  onHireableChange,
  onContactFilterChange,
  onSkillChange,
  onOpenToWorkFilterChange,
  search,
  location,
  category,
  sortBy,
  sortOrder,
  hireable,
  hasLinkedIn,
  hasX,
  hasEmail,
  skill,
  openToWorkFilter,
  isLoading
}: LeaderboardTableProps) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState({});

  const toggleSort = (id: string) => {
    if (sortBy === id) {
      onSortChange(id, sortOrder === "desc" ? "asc" : "desc");
    } else {
      onSortChange(id, "desc");
    }
  };

  const getSortIcon = (id: string) => {
    if (sortBy !== id) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortOrder === "desc" ? <ChevronDown className="ml-2 h-3 w-3 text-[#00F5A0]" /> : <ChevronRight className="ml-2 h-3 w-3 text-[#00F5A0] rotate-90" />;
  };

  const tableColumns = React.useMemo<ColumnDef<LeaderboardEntry>[]>(() => [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => <div className="font-medium text-slate-500">#{row.getValue("rank")}</div>,
    },
    {
      accessorKey: "username",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("username")}
          className="hover:bg-white/5 -ml-4 text-[10px] uppercase tracking-wider text-slate-400"
        >
          Developer
          {getSortIcon("username")}
        </Button>
      ),
      cell: ({ row }) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border border-white/10 rounded-lg">
              <AvatarImage src={entry.avatarUrl} alt={entry.username} className="rounded-lg object-cover" />
              <AvatarFallback className="rounded-lg bg-[#1a2236] text-slate-300">{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-bold text-white leading-none mb-1 text-sm">{entry.name || entry.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 mr-2 uppercase tracking-wide">@{entry.username}</span>
                {entry.email && (
                  <a href={`mailto:${entry.email}`} onClick={e => e.stopPropagation()} title="Email" className="text-slate-500 hover:text-white transition-colors">
                    <Mail className="h-3 w-3" />
                  </a>
                )}
                {entry.twitterUsername && (
                  <a href={`https://twitter.com/${entry.twitterUsername}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="Twitter" className="text-slate-500 hover:text-[#00D9F5] transition-colors">
                    <Twitter className="h-3 w-3" />
                  </a>
                )}
                {entry.linkedin && (
                  <a href={entry.linkedin.startsWith('http') ? entry.linkedin : `https://${entry.linkedin}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="LinkedIn" className="text-slate-500 hover:text-[#00D9F5] transition-colors">
                    <Linkedin className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalScore",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("totalScore")}
          className="hover:bg-white/5 -ml-4 text-[10px] uppercase tracking-wider text-slate-400"
        >
          {category ? `${category} Score` : "Score"}
          {getSortIcon("totalScore")}
        </Button>
      ),
      cell: ({ row }) => {
        const score = category 
          ? (row.original as any)[`${category.toLowerCase()}Score`] 
          : row.original.totalScore;
        return <div className="font-bold text-[#00F5A0] text-sm">{(score || 0).toFixed(1)}</div>;
      },
    },
    {
      accessorKey: "company",
      header: () => <div className="text-[10px] uppercase tracking-wider text-slate-400">Company</div>,
      cell: ({ row }) => <div className="text-slate-400 text-xs truncate max-w-[150px]">{row.getValue("company") || "—"}</div>,
    },
    {
      accessorKey: "location",
      header: () => <div className="text-[10px] uppercase tracking-wider text-slate-400">Location</div>,
      cell: ({ row }) => <div className="text-slate-400 text-xs truncate max-w-[150px]">{row.getValue("location") || "—"}</div>,
    },
    {
      accessorKey: "hireable",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("hireable")}
          className="hover:bg-white/5 -ml-4 text-[10px] uppercase tracking-wider text-slate-400"
        >
          Hireable
          {getSortIcon("hireable")}
        </Button>
      ),
      cell: ({ row }) => {
        const isHireable = row.getValue("hireable");
        return isHireable ? (
          <Badge variant="outline" className="bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md">
            Hireable
          </Badge>
        ) : null;
      },
    },
    {
      accessorKey: "isOpenToWork",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("isOpenToWork")}
          className="hover:bg-white/5 -ml-4 text-[10px] uppercase tracking-wider text-slate-400"
        >
          Open to Work
          {getSortIcon("isOpenToWork")}
        </Button>
      ),
      cell: ({ row }) => {
        const openToWork = row.getValue("isOpenToWork");
        if (openToWork === true) {
          return (
            <Badge variant="outline" className="bg-[#00D9F5]/10 text-[#00D9F5] border-[#00D9F5]/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md">
              Open
            </Badge>
          );
        } else if (openToWork === false) {
          return (
            <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md">
              Closed
            </Badge>
          );
        }
        return <span className="text-slate-600 text-[10px]">—</span>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("updatedAt")}
          className="hover:bg-white/5 -ml-4 text-[10px] uppercase tracking-wider text-slate-400"
        >
          Updated
          {getSortIcon("updatedAt")}
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt") || Date.now());
        return <div className="text-[10px] text-slate-500 uppercase tracking-widest">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/5 text-slate-500"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ], [category, sortBy, sortOrder]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    state: {
      columnVisibility,
      expanded,
    },
  });

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row gap-6 items-center mb-8">
        <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="SEARCH_DEV..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-[#0b0f1a] border border-white/10 pl-11 h-12 rounded-xl focus:border-[#00D9F5]/50 transition-colors text-xs font-bold tracking-wider uppercase text-white placeholder-slate-600"
            />
          </div>

          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="LOC_COORDINATES..."
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              className="w-full bg-[#0b0f1a] border border-white/10 pl-11 h-12 rounded-xl focus:border-[#00D9F5]/50 transition-colors text-xs font-bold tracking-wider uppercase text-white placeholder-slate-600"
            />
          </div>

          <div className="relative group md:col-span-2 lg:col-span-1">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="SKILL_SIGNALS..."
              value={skill}
              onChange={(event) => onSkillChange(event.target.value)}
              className="w-full bg-[#0b0f1a] border border-white/10 pl-11 h-12 rounded-xl focus:border-[#00D9F5]/50 transition-colors text-xs font-bold tracking-wider uppercase text-white placeholder-slate-600"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => onHireableChange(!hireable)}
            className={cn(
              "flex-1 md:flex-none h-12 bg-[#0b0f1a] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors px-6",
              hireable ? "border-[#00F5A0]/50 text-[#00F5A0] bg-[#00F5A0]/10" : "text-slate-400 hover:text-white"
            )}
          >
            <UserCheck className={cn("mr-2 h-4 w-4", hireable ? "text-[#00F5A0]" : "text-slate-500")} />
            HIREABLE
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none h-12 bg-[#0b0f1a] border border-white/10 rounded-xl text-slate-400 hover:text-white min-w-[160px] justify-between px-6 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  CONTACTS
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#121826] border border-white/10 text-slate-300 min-w-[200px] rounded-xl p-2 shadow-2xl">
              <DropdownMenuItem 
                className="flex items-center gap-3 hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg mb-1"
                onClick={() => onContactFilterChange("hasLinkedIn", !hasLinkedIn)}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  hasLinkedIn ? "bg-[#00D9F5] border-[#00D9F5]" : "bg-[#0b0f1a] border-white/20"
                )}>
                  {hasLinkedIn && <Check className="h-3.5 w-3.5 text-[#0b0f1a]" />}
                </div>
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg"
                onClick={() => onContactFilterChange("hasX", !hasX)}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  hasX ? "bg-[#00D9F5] border-[#00D9F5]" : "bg-[#0b0f1a] border-white/20"
                )}>
                  {hasX && <Check className="h-3.5 w-3.5 text-[#0b0f1a]" />}
                </div>
                Twitter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn(
                "flex-1 md:flex-none h-12 bg-[#0b0f1a] border border-white/10 rounded-xl min-w-[160px] justify-between px-6 text-xs font-bold uppercase tracking-wider",
                openToWorkFilter ? "border-[#00D9F5]/50 text-[#00D9F5]" : "text-slate-400 hover:text-white"
              )}>
                <span className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-slate-500" />
                  {openToWorkFilter === "true" ? "OPEN_TO_WORK" : openToWorkFilter === "false" ? "NOT_OPEN" : "OPEN_STATUS"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#121826] border border-white/10 text-slate-300 min-w-[200px] rounded-xl p-2 shadow-2xl">
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-3 hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg mb-1",
                  openToWorkFilter === "" && "bg-white/5"
                )}
                onClick={() => onOpenToWorkFilterChange("")}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  openToWorkFilter === "" ? "bg-[#00D9F5] border-[#00D9F5]" : "bg-[#0b0f1a] border-white/20"
                )}>
                  {openToWorkFilter === "" && <Check className="h-3.5 w-3.5 text-[#0b0f1a]" />}
                </div>
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-3 hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg mb-1",
                  openToWorkFilter === "true" && "bg-white/5"
                )}
                onClick={() => onOpenToWorkFilterChange("true")}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  openToWorkFilter === "true" ? "bg-[#00D9F5] border-[#00D9F5]" : "bg-[#0b0f1a] border-white/20"
                )}>
                  {openToWorkFilter === "true" && <Check className="h-3.5 w-3.5 text-[#0b0f1a]" />}
                </div>
                Open to Work
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-3 hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg",
                  openToWorkFilter === "false" && "bg-white/5"
                )}
                onClick={() => onOpenToWorkFilterChange("false")}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  openToWorkFilter === "false" ? "bg-[#00D9F5] border-[#00D9F5]" : "bg-[#0b0f1a] border-white/20"
                )}>
                  {openToWorkFilter === "false" && <Check className="h-3.5 w-3.5 text-[#0b0f1a]" />}
                </div>
                Not Open
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none h-12 bg-[#0b0f1a] border border-white/10 rounded-xl text-slate-400 hover:text-white min-w-[160px] justify-between px-6 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  {category ? category : "ALL_DOMAINS"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#121826] border border-white/10 text-slate-300 min-w-[200px] rounded-xl p-2 shadow-2xl">
              {["", "ai", "backend", "frontend", "devops", "data"].map((c) => (
                <DropdownMenuItem
                  key={c}
                  className="capitalize hover:bg-white/5 cursor-pointer text-xs font-bold uppercase tracking-wider p-3 rounded-lg mb-1"
                  onClick={() => onCategoryChange(c)}
                >
                  {c || "all_domains"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="dev-surface overflow-x-auto w-full">
        <div className="relative min-w-[800px]">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0b0f1a]/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-[#00D9F5]/20 border-t-[#00D9F5] rounded-full animate-spin" />
            </div>
          )}
          <Table>
            <TableHeader className="bg-transparent border-b border-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="py-4 px-6">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsExpanded() && "expanded"}
                      className={cn(
                        "border-white/5 transition-colors cursor-pointer group h-20",
                        row.getIsExpanded() ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                      )}
                      onClick={() => row.toggleExpanded()}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow className="bg-[#0b0f1a] border-white/5 hover:bg-transparent">
                        <TableCell colSpan={tableColumns.length} className="p-0 border-b border-white/5">
                          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="lg:col-span-2 space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                  <div className="shrink-0">
                                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border border-white/10 rounded-2xl relative">
                                      <AvatarImage src={row.original.avatarUrl} className="object-cover rounded-xl" />
                                      <AvatarFallback className="bg-[#121826] rounded-xl text-white">{row.original.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="text-left flex-1 min-w-0">
                                    <h3 className="text-2xl md:text-3xl text-white font-bold tracking-tight mb-2 truncate">{row.original.name || row.original.username}</h3>
                                    <p className="text-slate-500 tracking-wider font-bold uppercase text-xs">IDENT::{row.original.username}</p>
                                  </div>
                                </div>
                                
                                {row.original.bio && (
                                  <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl border-l-2 border-[#00D9F5]/30 pl-4 py-1 italic text-left">
                                    &ldquo;{row.original.bio}&rdquo;
                                  </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                  {row.original.location && (
                                    <div className="flex items-center gap-3 text-slate-400 group/item">
                                      <MapPin className="h-4 w-4 text-[#00D9F5] shrink-0" />
                                      <span className="text-xs font-bold uppercase tracking-wider truncate">{row.original.location}</span>
                                    </div>
                                  )}
                                  {row.original.company && (
                                    <div className="flex items-center gap-3 text-slate-400 group/item">
                                      <Building2 className="h-4 w-4 text-[#7F5AF0] shrink-0" />
                                      <span className="text-xs font-bold uppercase tracking-wider truncate">{row.original.company}</span>
                                    </div>
                                  )}
                                  {row.original.blog && (
                                    <div className="flex items-center gap-3 text-slate-400 group/item min-w-0">
                                      <LinkIcon className="h-4 w-4 text-[#00F5A0] shrink-0" />
                                      <a href={row.original.blog.startsWith('http') ? row.original.blog : `https://${row.original.blog}`} 
                                         target="_blank" 
                                         className="text-xs font-bold uppercase tracking-wider hover:text-white transition-colors truncate block"
                                         onClick={(e) => e.stopPropagation()}
                                      >
                                        {row.original.blog.replace(/^https?:\/\//, '')}
                                      </a>
                                    </div>
                                  )}
                                  {row.original.twitterUsername && (
                                    <div className="flex items-center gap-3 text-slate-400 group/item min-w-0">
                                      <Twitter className="h-4 w-4 text-[#00D9F5] shrink-0" />
                                      <a href={`https://twitter.com/${row.original.twitterUsername}`} 
                                         target="_blank" 
                                         className="text-xs font-bold uppercase tracking-wider hover:text-white transition-colors truncate block"
                                         onClick={(e) => e.stopPropagation()}
                                      >
                                        @{row.original.twitterUsername}
                                      </a>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                                  <Link href={`/user/${row.original.username}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                                      <Button className="w-full bg-[#00D9F5] text-[#0b0f1a] hover:bg-[#00D9F5]/90 h-10 rounded-lg transition-colors font-bold uppercase tracking-wider text-xs">
                                        EXECUTE_ANALYSIS
                                      </Button>
                                  </Link>
                                  <a href={row.original.url || `https://github.com/${row.original.username}`} 
                                     target="_blank" 
                                     className="flex-1"
                                     onClick={(e) => e.stopPropagation()}
                                  >
                                      <Button variant="outline" className="w-full h-10 border-white/10 bg-[#121826] text-white hover:bg-[#1a2236] px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold uppercase tracking-wider text-xs">
                                        <Github className="h-4 w-4" />
                                        VIEW_GITHUB
                                      </Button>
                                  </a>
                               </div>
                             </div>
                             
                             <div className="flex flex-col gap-6 lg:border-l lg:border-white/5 lg:pl-10">
                               <div>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 text-left">Signals Identified</p>
                                 <div className="flex flex-wrap gap-2 mb-6">
                                   {row.original.uniqueSkills && row.original.uniqueSkills.length > 0 ? (
                                     row.original.uniqueSkills.map((skill) => (
                                       <span key={skill} className="px-2.5 py-1 bg-[#1a2236] border border-white/5 rounded text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                         {skill}
                                       </span>
                                     ))
                                   ) : (
                                     <span className="text-xs text-slate-600 font-bold uppercase tracking-wider text-left">NO_SIGNALS</span>
                                   )}
                                 </div>
                                 
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 text-left">Protocol Score</p>
                                 <div className="flex items-end gap-3 mb-2">
                                   <p className="text-5xl md:text-6xl font-bold text-[#00F5A0] tracking-tighter tabular-nums text-left leading-none">{row.original.totalScore.toFixed(0)}</p>
                                 </div>
                               </div>
                               
                               <SkillBreakdown 
                                 scores={{
                                   total: row.original.totalScore,
                                   ai: row.original.aiScore || 0,
                                   backend: row.original.backendScore || 0,
                                   frontend: row.original.frontendScore || 0,
                                   devops: row.original.devopsScore || 0,
                                   data: row.original.dataScore || 0,
                                 }}
                               />
                             </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-32 text-center text-slate-500 font-bold tracking-widest uppercase text-xs">
                    0_MATCHES_FOUND
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-2">
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          Showing <span className="text-white">{pageIndex * pageSize + 1}</span>-
          <span className="text-white">{Math.min((pageIndex + 1) * pageSize, totalCount)}</span> OF{""}
          <span className="text-white">{totalCount}</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="h-10 bg-[#121826] border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors rounded-lg px-6 text-xs font-bold uppercase tracking-wider"
          >
            PREV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={(pageIndex + 1) * pageSize >= totalCount}
            className="h-10 bg-[#121826] border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors rounded-lg px-6 text-xs font-bold uppercase tracking-wider"
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  );
}
