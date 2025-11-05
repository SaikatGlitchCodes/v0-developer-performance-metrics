import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface EngineerProfileLinkProps {
  githubUsername: string
  displayName: string
  avatarUrl?: string
  productivityScore?: number
  mergeRate?: number
}

export function EngineerProfileLink({
  githubUsername,
  displayName,
  avatarUrl,
  productivityScore,
  mergeRate,
}: EngineerProfileLinkProps) {
  return (
    <Link href={`/engineer/${githubUsername}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {avatarUrl && (
              <img src={avatarUrl || "/placeholder.svg"} alt={displayName} className="w-12 h-12 rounded-full" />
            )}
            <div className="flex-1">
              <p className="font-semibold hover:text-primary">{displayName}</p>
              <p className="text-sm text-muted-foreground">@{githubUsername}</p>
              {(productivityScore || mergeRate) && (
                <div className="flex gap-3 mt-2 text-xs">
                  {productivityScore && <span>Prod: {productivityScore.toFixed(0)}%</span>}
                  {mergeRate && <span>Merge: {mergeRate.toFixed(0)}%</span>}
                </div>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
