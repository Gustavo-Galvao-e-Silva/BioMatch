import { Database } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function StudyIdentification({ formData, setFormData }: any) {
  return (
    <div className="glass p-6 rounded-2xl space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 text-secondary">
        <Database className="w-5 h-5" /> Study Identification
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>NCT ID (ex: NCT01234567)</Label>
          <Input 
            placeholder="NCT..." 
            value={formData.nct_id}
            onChange={e => setFormData({...formData, nct_id: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Sponsor / Institution</Label>
          <Input 
            placeholder="University or Pharma name" 
            value={formData.sponsor}
            onChange={e => setFormData({...formData, sponsor: e.target.value})}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>Brief Title</Label>
          <Input 
            placeholder="The public title of the study" 
            value={formData.brief_title}
            onChange={e => setFormData({...formData, brief_title: e.target.value})}
            required
          />
        </div>
      </div>
    </div>
  );
}