import { Card, CardContent } from "@/components/ui/card"

export function StatsCard({
  title,
  value,
  icon,
  iconColor = "text-orange-500"
}) {
  return (
    (<Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className={`${iconColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>)
  );
}

