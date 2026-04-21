import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function InsightSmallCard({ title, label, value, subValue, icon, color }: any) {
  const colorStyles: any = {
    primary: "bg-primary/20 text-primary border-primary/30",
    blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    green: "bg-green-500/20 text-green-500 border-green-500/30",
    orange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    purple: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    amber: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  }

  const blurColors: any = {
    primary: "bg-primary",
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
  }

  return (
    <Card className="border-none bg-card/40 backdrop-blur-md relative overflow-hidden group">
      <div className={`absolute -right-2 -bottom-2 h-16 w-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-50 ${blurColors[color] || 'bg-primary'}`} />
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 shadow-sm ${colorStyles[color] || colorStyles.primary}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{title || label}</p>
            <h4 className="text-xl font-bold tracking-tight">{value}</h4>
            {subValue && (
               <p className="text-[9px] font-medium text-muted-foreground opacity-60 truncate">{subValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCard({ title, value, icon, trend, description, color }: any) {
  const glowColors: any = {
    blue: "bg-blue-500/20",
    green: "bg-green-500/20",
    orange: "bg-orange-500/20",
    purple: "bg-purple-500/20",
    amber: "bg-amber-500/20",
    primary: "bg-primary/20",
  }

  const iconColors: any = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200/50 dark:border-green-800/50",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50",
    amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
    primary: "text-primary bg-primary/10 border-primary/20",
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-card/60 backdrop-blur-md relative">
      {/* Decorative Glow Orb */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-30 ${glowColors[color] || glowColors.primary}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border ${iconColors[color] || iconColors.primary}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-black tracking-tight">{value}</div>
        <div className="flex items-center mt-1">
          {trend !== undefined && trend !== 0 ? (
            <span className={`text-xs font-black mr-1 flex items-center ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
               <TrendingUp className={`h-3 w-3 mr-0.5 ${trend < 0 ? 'rotate-180' : ''}`} />
               {Math.abs(trend)}%
            </span>
          ) : null}
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
