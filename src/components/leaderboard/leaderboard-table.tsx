"use client";

import * as React from"react";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from"@tanstack/react-table";
import { ChevronDown, ChevronRight, Mail, MapPin, Link as LinkIcon, Twitter, Building2, Calendar, Search, ArrowUpDown, Github, Filter, UserCheck, Linkedin, Check } from"lucide-react";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from"@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Badge } from"@/components/ui/badge";
import { LeaderboardEntry } from"@/lib/scoring";
import Link from"next/link";
import { cn } from"@/lib/utils";
import { SkillBreakdown } from"@/components/SkillBreakdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu";

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
  onContactFilterChange: (type:"hasLinkedIn" |"hasX" |"hasEmail", value: boolean) => void;
  onSkillChange: (skill: string) => void;
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
  isLoading
}: LeaderboardTableProps) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState({});

  const toggleSort = (id: string) => {
    if (sortBy === id) {
      onSortChange(id, sortOrder ==="desc" ?"asc" :"desc");
    } else {
      onSortChange(id,"desc");
    }
  };

  const getSortIcon = (id: string) => {
    if (sortBy !== id) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortOrder ==="desc" ? <ChevronDown className="ml-2 h-3 w-3 text-green-400" /> : <ChevronRight className="ml-2 h-3 w-3 text-green-400 rotate-90" />;
  };

  const tableColumns = React.useMemo<ColumnDef<LeaderboardEntry>[]>(() => [
    {
      accessorKey:"rank",
      header:"Rank",
      cell: ({ row }) => <div className=" font-medium text-gray-500">#{row.getValue("rank")}</div>,
    },
    {
      accessorKey:"username",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("username")}
 className="hover:bg-gray-900 -ml-4  text-xs uppercase tracking-wider"
        >
          Developer
          {getSortIcon("username")}
        </Button>
      ),
      cell: ({ row }) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-800">
              <AvatarImage src={entry.avatarUrl} alt={entry.username} />
              <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-gray-200 leading-none mb-1">{entry.name || entry.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500  mr-1">@{entry.username}</span>
                {entry.email && (
                  <a href={`mailto:${entry.email}`} onClick={e => e.stopPropagation()} title="Email" className="text-gray-600 hover:text-yellow-400 transition-colors">
                    <Mail className="h-3 w-3" />
                  </a>
                )}
                {entry.twitterUsername && (
                  <a href={`https://twitter.com/${entry.twitterUsername}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="Twitter" className="text-gray-600 hover:text-cyan-400 transition-colors">
                    <Twitter className="h-3 w-3" />
                  </a>
                )}
                {entry.linkedin && (
                  <a href={entry.linkedin.startsWith('http') ? entry.linkedin : `https://${entry.linkedin}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="LinkedIn" className="text-gray-600 hover:text-blue-400 transition-colors">
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
      accessorKey:"totalScore",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("totalScore")}
 className="hover:bg-gray-900 -ml-4  text-xs uppercase tracking-wider"
        >
          {category ? `${category} Score` :"Score"}
          {getSortIcon("totalScore")}
        </Button>
      ),
      cell: ({ row }) => {
        const score = category 
          ? (row.original as any)[`${category.toLowerCase()}Score`] 
          : row.original.totalScore;
        return <div className=" font-bold text-green-400">{(score || 0).toFixed(1)}</div>;
      },
    },
    {
      accessorKey:"company",
      header:"Company",
      cell: ({ row }) => <div className="text-gray-400 truncate max-w-[150px]">{row.getValue("company") ||"—"}</div>,
    },
    {
      accessorKey:"location",
      header:"Location",
      cell: ({ row }) => <div className="text-gray-400 truncate max-w-[150px]">{row.getValue("location") ||"—"}</div>,
    },
    {
      accessorKey:"hireable",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("hireable")}
 className="hover:bg-gray-900 -ml-4  text-xs uppercase tracking-wider"
        >
          Hireable
          {getSortIcon("hireable")}
        </Button>
      ),
      cell: ({ row }) => {
        const isHireable = row.getValue("hireable");
        return isHireable ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">
            Hireable
          </Badge>
        ) : null;
      },
    },
    {
      accessorKey:"updatedAt",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("updatedAt")}
 className="hover:bg-gray-900 -ml-4  text-xs uppercase tracking-wider"
        >
          Updated
          {getSortIcon("updatedAt")}
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt") || Date.now());
        return <div className="text-xs text-gray-500 ">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id:"expander",
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
 className="h-8 w-8 p-0 hover:bg-gray-800 text-gray-500"
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
    <div className="w-full space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
        <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search username or name..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
 className="w-full bg-gray-950 border-gray-800 pl-10 focus:ring-green-400 focus:border-green-400/50 transition-all text-sm"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter by city/country..."
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
 className="w-full bg-gray-950 border-gray-800 pl-10 focus:ring-green-400 focus:border-green-400/50 transition-all text-sm"
            />
          </div>

          <div className="relative md:col-span-2">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter by expertise (e.g. react, python, docker)..."
              value={skill}
              onChange={(event) => onSkillChange(event.target.value)}
 className="w-full bg-gray-950 border-gray-800 pl-10 focus:ring-green-400 focus:border-green-400/50 transition-all text-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => onHireableChange(!hireable)}
            className={cn(
"flex-1 md:flex-none bg-gray-950 border-gray-800 text-xs  uppercase tracking-widest transition-all",
              hireable ?"border-green-500/50 text-green-400 bg-green-500/5" :"text-gray-400"
            )}
          >
            <UserCheck className={cn("mr-2 h-3.5 w-3.5", hireable ?"text-green-400" :"text-gray-500")} />
            Hireable Only
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none bg-gray-950 border-gray-800 text-gray-400 hover:text-white min-w-[180px] justify-between">
                <span className="flex items-center gap-2 text-xs  uppercase tracking-widest">
                  <Mail className="h-3.5 w-3.5" />
                  CONTACT FILTERS
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800 text-gray-200 min-w-[180px]">
              <DropdownMenuItem 
 className="flex items-center gap-2 focus:bg-gray-800 cursor-pointer text-xs "
                onClick={() => onContactFilterChange("hasLinkedIn", !hasLinkedIn)}
              >
                <div className={cn(
"h-4 w-4 rounded border border-gray-700 flex items-center justify-center transition-all",
                  hasLinkedIn ?"bg-green-500 border-green-500" :"bg-gray-950"
                )}>
                  {hasLinkedIn && <Check className="h-3 w-3 text-black" />}
                </div>
                Has LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem 
 className="flex items-center gap-2 focus:bg-gray-800 cursor-pointer text-xs "
                onClick={() => onContactFilterChange("hasX", !hasX)}
              >
                <div className={cn(
"h-4 w-4 rounded border border-gray-700 flex items-center justify-center transition-all",
                  hasX ?"bg-green-500 border-green-500" :"bg-gray-950"
                )}>
                  {hasX && <Check className="h-3 w-3 text-black" />}
                </div>
                Has X (Twitter)
              </DropdownMenuItem>
              <DropdownMenuItem 
 className="flex items-center gap-2 focus:bg-gray-800 cursor-pointer text-xs "
                onClick={() => onContactFilterChange("hasEmail", !hasEmail)}
              >
                <div className={cn(
"h-4 w-4 rounded border border-gray-700 flex items-center justify-center transition-all",
                  hasEmail ?"bg-green-500 border-green-500" :"bg-gray-950"
                )}>
                  {hasEmail && <Check className="h-3 w-3 text-black" />}
                </div>
                Has Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none bg-gray-950 border-gray-800 text-gray-400 hover:text-white min-w-[180px] justify-between">
                <span className="flex items-center gap-2 text-xs  uppercase tracking-widest">
                  <Filter className="h-3.5 w-3.5" />
                  {category ? category :"ALL CATEGORIES"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800 text-gray-200 min-w-[180px]">
              {["","ai","backend","frontend","devops","data"].map((c) => (
                <DropdownMenuItem 
                  key={c} 
 className="capitalize focus:bg-gray-800 cursor-pointer text-xs "
                  onClick={() => onCategoryChange(c)}
                >
                  {c ||"All Categories"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-gray-800 bg-gray-950 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
          </div>
        )}
        <Table>
          <TableHeader className="bg-gray-900/50 border-b border-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-500  text-xs uppercase tracking-wider py-4">
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
                    data-state={row.getIsExpanded() &&"expanded"}
                    className={cn(
"border-gray-800 transition-colors cursor-pointer group",
                        row.getIsExpanded() ?"bg-gray-900/60" :"hover:bg-gray-900/40"
                    )}
                    onClick={() => row.toggleExpanded()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="bg-gray-900/20 border-gray-800 hover:bg-gray-900/20">
                      <TableCell colSpan={tableColumns.length} className="p-0 border-b border-gray-800">
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="lg:col-span-2 space-y-6">
                              <div className="flex items-start gap-5">
                                <Avatar className="h-20 w-20 border-2 border-gray-800 shadow-2xl">
                                  <AvatarImage src={row.original.avatarUrl} />
                                  <AvatarFallback>{row.original.username.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="pt-2 text-left">
                                  <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{row.original.name || row.original.username}</h3>
                                  <div className="flex items-center gap-2">
                                    <p className="text-gray-400 ">@{row.original.username}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {row.original.bio && (
                                <p className="text-gray-300 text-base leading-relaxed max-w-lg border-l-2 border-green-500/30 pl-4 py-1 italic text-left">
                                  {row.original.bio}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {row.original.location && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <MapPin className="h-4 w-4 text-gray-600 group-hover/item:text-red-400 transition-colors" />
                                    <span className="text-sm">{row.original.location}</span>
                                  </div>
                                )}
                                {row.original.company && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <Building2 className="h-4 w-4 text-gray-600 group-hover/item:text-cyan-400 transition-colors" />
                                    <span className="text-sm">{row.original.company}</span>
                                  </div>
                                )}
                                {row.original.blog && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <LinkIcon className="h-4 w-4 text-gray-600 group-hover/item:text-green-400 transition-colors" />
                                    <a href={row.original.blog.startsWith('http') ? row.original.blog : `https://${row.original.blog}`} 
                                       target="_blank" 
 className="text-sm hover:text-green-400 transition-colors truncate max-w-[200px]"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                      {row.original.blog.replace(/^https?:\/\//, '')}
                                    </a>
                                  </div>
                                )}
                                {row.original.twitterUsername && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <Twitter className="h-4 w-4 text-gray-600 group-hover/item:text-cyan-400 transition-colors" />
                                    <a href={`https://twitter.com/${row.original.twitterUsername}`} 
                                       target="_blank" 
 className="text-sm hover:text-cyan-400 transition-colors"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                      @{row.original.twitterUsername}
                                    </a>
                                  </div>
                                )}
                                {row.original.linkedin && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <Linkedin className="h-4 w-4 text-gray-600 group-hover/item:text-blue-400 transition-colors" />
                                    <a href={row.original.linkedin.startsWith('http') ? row.original.linkedin : `https://${row.original.linkedin}`} 
                                       target="_blank" 
 className="text-sm hover:text-blue-400 transition-colors"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                      LinkedIn Profile
                                    </a>
                                  </div>
                                )}
                                {row.original.email && (
                                  <div className="flex items-center gap-3 text-gray-400 group/item">
                                    <Mail className="h-4 w-4 text-gray-600 group-hover/item:text-yellow-400 transition-colors" />
                                    <a href={`mailto:${row.original.email}`} 
 className="text-sm hover:text-yellow-400 transition-colors"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                      {row.original.email}
                                    </a>
                                  </div>
                                )}
                                {row.original.createdAt && (
                                  <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm">Joined {new Date(row.original.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs md:max-w-none pt-4">
                                <Link href={`/user/${row.original.username}`} className="flex-1 md:flex-none" onClick={(e) => e.stopPropagation()}>
                                    <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold px-8 transition-all">
                                      Detailed Analysis
                                    </Button>
                                </Link>
                                <a href={row.original.url || `https://github.com/${row.original.username}`} 
                                   target="_blank" 
 className="flex-1 md:flex-none"
                                   onClick={(e) => e.stopPropagation()}
                                >
                                    <Button variant="outline" className="w-full border-gray-700 bg-white text-black hover:bg-gray-200 font-bold px-8 flex items-center gap-2 transition-all">
                                      <Github className="h-4 w-4" />
                                      View GitHub Profile
                                    </Button>
                                </a>
                             </div>
                           </div>
                           
                           <div className="flex flex-col gap-8 border-l border-gray-800 pl-12">
                             <div>
                               <p className="text-xs text-gray-500 uppercase  tracking-widest mb-2 text-left">Top Expertise</p>
                               <div className="flex flex-wrap gap-2 mb-6">
                                 {row.original.uniqueSkills && row.original.uniqueSkills.length > 0 ? (
                                   row.original.uniqueSkills.map((skill) => (
                                     <Badge key={skill} variant="outline" className="bg-gray-900 border-gray-800 text-gray-300  text-[10px] lowercase px-2 py-0.5">
                                       {skill}
                                     </Badge>
                                   ))
                                 ) : (
                                   <span className="text-xs text-gray-600  italic text-left">No specific skills identified yet.</span>
                                 )}
                               </div>
                               
                               <p className="text-xs text-gray-500 uppercase  tracking-widest mb-2 text-left">Contribution Score</p>
                               <div className="flex items-baseline gap-1 mb-8">
                                 <p className="text-7xl  font-black text-white tracking-tighter tabular-nums text-left">{row.original.totalScore.toFixed(0)}</p>
                                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
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
                <TableCell colSpan={tableColumns.length} className="h-32 text-center text-gray-500 ">
                  No developers found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-500 ">
          Showing <span className="text-gray-300">{pageIndex * pageSize + 1}</span>-
          <span className="text-gray-300">{Math.min((pageIndex + 1) * pageSize, totalCount)}</span> of{""}
          <span className="text-gray-300">{totalCount}</span> developers
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
 className="bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 transition-all"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={(pageIndex + 1) * pageSize >= totalCount}
 className="bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 transition-all"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
