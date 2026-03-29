import { MapPin } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function GlobalReach({ formData, setFormData }: any) {
  return (
    <div className="glass p-6 rounded-2xl space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 text-secondary">
        <MapPin className="w-5 h-5" /> Global Reach
      </h2>
      <div className="space-y-2">
        <Label>Countries (Comma separated)</Label>
        <Input 
          placeholder="USA, Brazil, Germany..." 
          value={formData.countries}
          onChange={e => setFormData({...formData, countries: e.target.value})}
        />
      </div>
    </div>
  );
}