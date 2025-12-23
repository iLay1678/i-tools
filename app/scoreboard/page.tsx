"use client";

import { useState } from "react";
import { Tally5, Plus, Minus, RotateCcw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ScoreboardPage() {
  const [teamA, setTeamA] = useState({ name: "红队", score: 0, color: "bg-rose-500", border: "border-rose-500" });
  const [teamB, setTeamB] = useState({ name: "蓝队", score: 0, color: "bg-blue-500", border: "border-blue-500" });
  const [editTeam, setEditTeam] = useState<"A" | "B" | null>(null);
  const [tempName, setTempName] = useState("");

  const handleReset = () => {
    setTeamA({ ...teamA, score: 0 });
    setTeamB({ ...teamB, score: 0 });
  };

  const handleSwap = () => {
    const temp = { ...teamA };
    setTeamA({ ...teamB });
    setTeamB(temp);
  };

  const saveName = () => {
    if (editTeam === "A") setTeamA({ ...teamA, name: tempName || teamA.name });
    else if (editTeam === "B") setTeamB({ ...teamB, name: tempName || teamB.name });
    setEditTeam(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-blue-600 shadow-lg">
            <Tally5 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">记分板</h1>
            <p className="text-muted-foreground">红蓝双方比分实时记录</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleSwap}>交换位置</Button>
           <Button variant="outline" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              重置比分
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        <TeamDisplay 
          team={teamA} 
          onScoreChange={(val) => setTeamA({ ...teamA, score: Math.max(0, teamA.score + val) })}
          onNameEdit={() => {
            setEditTeam("A");
            setTempName(teamA.name);
          }}
        />
        <TeamDisplay 
          team={teamB} 
          onScoreChange={(val) => setTeamB({ ...teamB, score: Math.max(0, teamB.score + val) })}
          onNameEdit={() => {
            setEditTeam("B");
            setTempName(teamB.name);
          }}
        />
      </div>

      {/* Manual Modal */}
      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <Card className="w-full max-w-sm shadow-2xl">
              <CardHeader>
                 <CardTitle>修改队伍名称</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Input 
                   value={tempName} 
                   onChange={(e) => setTempName(e.target.value)}
                   autoFocus
                   placeholder="输入名称..."
                   onKeyDown={(e) => e.key === "Enter" && saveName()}
                 />
                 <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setEditTeam(null)}>取消</Button>
                    <Button onClick={saveName}>确定</Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}

function TeamDisplay({ team, onScoreChange, onNameEdit }: { team: any, onScoreChange: (v: number) => void, onNameEdit: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-between py-12 space-y-10 relative overflow-hidden bg-card/50">
      <div className={cn("absolute top-0 left-0 w-full h-3", team.color)} />
      
      <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-all" onClick={onNameEdit}>
        <h2 className="text-4xl font-black tracking-tight">{team.name}</h2>
        <Edit2 className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="text-[14rem] font-black tracking-tighter tabular-nums leading-none select-none drop-shadow-sm">
        {team.score}
      </div>

      <div className="flex gap-8">
        <button 
          className="h-24 w-24 rounded-3xl border-4 border-muted hover:bg-muted transition-colors flex items-center justify-center group"
          onClick={() => onScoreChange(-1)}
        >
          <Minus className="h-12 w-12 text-muted-foreground group-hover:text-foreground" />
        </button>
        <button 
          className={cn("h-24 w-24 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center", team.color)}
          onClick={() => onScoreChange(1)}
        >
          <Plus className="h-12 w-12 text-white fill-current" />
        </button>
      </div>
    </Card>
  );
}