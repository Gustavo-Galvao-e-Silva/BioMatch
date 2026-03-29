import { Beaker } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function ClinicalDetails({ formData, setFormData }: any) {
  return (
    <div className="glass p-6 rounded-2xl space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 text-secondary">
        <Beaker className="w-5 h-5" /> Clinical Details
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Conditions (Comma separated)</Label>
          <Input 
            placeholder="Diabetes, Hypertension..." 
            value={formData.conditions}
            onChange={e => setFormData({...formData, conditions: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Study Type</Label>
            <select 
              className="w-full p-2 rounded-md border border-border bg-background text-sm"
              value={formData.study_type}
              onChange={e => setFormData({...formData, study_type: e.target.value})}
            >
              <option value="INTERVENTIONAL">Interventional</option>
              <option value="OBSERVATIONAL">Observational</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Current Status</Label>
            <select 
              className="w-full p-2 rounded-md border border-border bg-background text-sm"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="RECRUITING">Recruiting</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}