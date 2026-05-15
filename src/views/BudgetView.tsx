import React, { useState, useRef } from 'react';
import { useWorkspace } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Download, Upload, Info, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BudgetLineItem } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function BudgetView() {
  const { workspace, activeProjectId, updateProject } = useWorkspace();
  const project = workspace.projects.find(p => p.id === activeProjectId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conversionRate, setConversionRate] = useState<string>(
    project?.budget?.conversionRate?.toString() || '1'
  );

  if (!project) return null;

  const handleUpdateConversionRate = () => {
    const rate = parseFloat(conversionRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Invalid conversion rate');
      return;
    }
    
    updateProject(activeProjectId, {
      budget: { 
        ...project.budget,
        total: project.budget?.total || 0,
        spent: project.budget?.spent || 0,
        currency: project.budget?.currency || '$',
        conversionRate: rate,
        lineItems: project.budget?.lineItems || []
      }
    });
    toast.success('Conversion rate updated');
  };

  const handleUpdateLineItem = (id: string, field: keyof BudgetLineItem, value: any) => {
    updateProject(activeProjectId, {
      budget: { 
        ...project.budget, 
        total: project.budget?.total || 0,
        spent: project.budget?.spent || 0,
        currency: project.budget?.currency || '$',
        lineItems: project.budget?.lineItems?.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        ) || [],
        conversionRate: project.budget?.conversionRate || parseFloat(conversionRate) || 1
      }
    });
  };

  const handleAddLineItem = () => {
    const newItem: BudgetLineItem = {
      id: Math.random().toString(36).substring(2, 9),
      srNo: '',
      point: 'New Item',
      capitalInvestment: '',
      taskCompleted: '',
      percentCompletion: 0,
      estimatedKINR: 0,
      actualKINR: 0,
      remarks: ''
    };
    
    updateProject(activeProjectId, {
      budget: { 
        ...project.budget, 
        total: project.budget?.total || 0,
        spent: project.budget?.spent || 0,
        currency: project.budget?.currency || '$',
        lineItems: [...(project.budget?.lineItems || []), newItem],
        conversionRate: project.budget?.conversionRate || parseFloat(conversionRate) || 1
      }
    });
  };

  const handleDeleteLineItem = (id: string) => {
    updateProject(activeProjectId, {
      budget: { 
        ...project.budget, 
        total: project.budget?.total || 0,
        spent: project.budget?.spent || 0,
        currency: project.budget?.currency || '$',
        lineItems: (project.budget?.lineItems || []).filter(item => item.id !== id),
        conversionRate: project.budget?.conversionRate || parseFloat(conversionRate) || 1
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);
      
      const parsedItems: BudgetLineItem[] = rows.map(row => ({
        id: Math.random().toString(36).substring(2, 9),
        srNo: row['Sr. No']?.toString() || row['Sr.No']?.toString() || '',
        point: row['Point']?.toString() || '',
        capitalInvestment: row['Capital Investment']?.toString() || '',
        taskCompleted: row['Task Completed']?.toString() || '',
        percentCompletion: parseFloat(row['% Completion']) || 0,
        estimatedKINR: parseFloat(row['Estimated_KINR'] || row['Estimated KINR']) || 0,
        actualKINR: parseFloat(row['Actual_KINR'] || row['Actual _KINR'] || row['Actual KINR']) || 0,
        remarks: row['Remarks']?.toString() || '',
      }));

      // Calculate totals
      const totalEstimatedKINR = parsedItems.reduce((acc, item) => acc + item.estimatedKINR, 0);
      const totalActualKINR = parsedItems.reduce((acc, item) => acc + item.actualKINR, 0);

      updateProject(activeProjectId, {
        budget: { 
          ...project.budget, 
          total: totalEstimatedKINR, 
          spent: totalActualKINR,
          currency: 'KINR',
          lineItems: parsedItems,
          conversionRate: project.budget?.conversionRate || parseFloat(conversionRate) || 1
        }
      });

      toast.success(`Successfully loaded ${parsedItems.length} records`);
    } catch (error) {
      toast.error('Failed to parse Excel file. Check format.');
      console.error(error);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        'Sr. No': '1',
        'Point': 'Design UI',
        'Capital Investment': 'Yes',
        'Task Completed': 'Yes',
        '% Completion': 100,
        'Estimated_KINR': 50000,
        'Actual_KINR': 45000,
        'Remarks': 'Done early'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budget");
    XLSX.writeFile(wb, "budget_template.xlsx");
  };

  const budget = project.budget || { total: 0, spent: 0, currency: '$', conversionRate: 1, lineItems: [] };
  const lineItems = budget.lineItems || [];
  const rate = budget.conversionRate || 1;

  const totalEstimatedKINR = lineItems.reduce((sum, item) => sum + item.estimatedKINR, 0);
  const totalActualKINR = lineItems.reduce((sum, item) => sum + item.actualKINR, 0);
  
  const totalEstimatedKSEK = totalEstimatedKINR * rate;
  const totalActualKSEK = totalActualKINR * rate;

  const overallPercentage = totalEstimatedKINR > 0 ? Math.min(100, Math.round((totalActualKINR / totalEstimatedKINR) * 100)) : 0;
  const isOverBudget = totalActualKINR > totalEstimatedKINR;

  return (
    <div className="p-4 h-full overflow-auto bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-semibold">Project Budget Tracker</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" /> Template
            </Button>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button variant="default" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload Excel
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview (Summary)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Total Estimated Budget</span>
                      <div className="font-semibold text-lg">{totalEstimatedKINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KINR</div>
                      <div className="text-xs text-muted-foreground">{totalEstimatedKSEK.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KSEK</div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Amount Utilized</span>
                      <div className={`font-semibold text-lg ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                        {totalActualKINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KINR
                      </div>
                      <div className="text-xs text-muted-foreground">{totalActualKSEK.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KSEK</div>
                   </div>
                </div>
                
                <Progress value={overallPercentage} className={`h-3 ${isOverBudget ? 'bg-red-200 [&>div]:bg-red-500' : ''}`} />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{overallPercentage}% used</span>
                  <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {Math.abs(totalEstimatedKINR - totalActualKINR).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KINR {isOverBudget ? 'over' : 'remaining'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Conversion Rate (1 KINR to KSEK)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={conversionRate} 
                    onChange={e => setConversionRate(e.target.value)}
                    placeholder="e.g. 0.12" 
                    step="0.001"
                  />
                  <Button onClick={handleUpdateConversionRate}>Update</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Estimated_KSEK = Estimated_KINR * Conversion Rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {lineItems.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Budget Details Breakdown</CardTitle>
              <Button size="sm" onClick={handleAddLineItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="whitespace-nowrap">Sr. No</TableHead>
                    <TableHead className="min-w-[200px]">Point</TableHead>
                    <TableHead className="whitespace-nowrap">Capital Inv.</TableHead>
                    <TableHead className="whitespace-nowrap">Completed</TableHead>
                    <TableHead className="text-right whitespace-nowrap">% Comp.</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Est. KINR</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-muted-foreground bg-muted/30">Est. KSEK</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Act. KINR</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-muted-foreground bg-muted/30">Act. KSEK</TableHead>
                    <TableHead className="text-right whitespace-nowrap">% Utilized</TableHead>
                    <TableHead className="text-right whitespace-nowrap">% Contrib.</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, i) => {
                    const estKSEK = item.estimatedKINR * rate;
                    const actKSEK = item.actualKINR * rate;
                    const utilized = item.estimatedKINR > 0 ? (item.actualKINR / item.estimatedKINR) * 100 : 0;
                    const contribution = totalEstimatedKINR > 0 ? (item.estimatedKINR / totalEstimatedKINR) * 100 : 0;
                    
                    return (
                      <TableRow key={item.id || i}>
                        <TableCell>
                          <Input value={item.srNo} onChange={(e) => handleUpdateLineItem(item.id, 'srNo', e.target.value)} className="h-8 min-w-[60px] p-1 border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none" />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Input value={item.point} onChange={(e) => handleUpdateLineItem(item.id, 'point', e.target.value)} className="h-8 min-w-[150px] p-1 border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none font-medium" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.capitalInvestment} onChange={(e) => handleUpdateLineItem(item.id, 'capitalInvestment', e.target.value)} className="h-8 p-1 border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.taskCompleted} onChange={(e) => handleUpdateLineItem(item.id, 'taskCompleted', e.target.value)} className="h-8 p-1 border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={item.percentCompletion || ''} onChange={(e) => handleUpdateLineItem(item.id, 'percentCompletion', parseFloat(e.target.value) || 0)} className="h-8 w-[80px] p-1 text-right ml-auto border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none" />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <Input type="number" value={item.estimatedKINR || ''} onChange={(e) => handleUpdateLineItem(item.id, 'estimatedKINR', parseFloat(e.target.value) || 0)} className="h-8 w-[100px] p-1 text-right ml-auto border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none font-medium" />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground bg-muted/30">{estKSEK.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-medium">
                          <Input type="number" value={item.actualKINR || ''} onChange={(e) => handleUpdateLineItem(item.id, 'actualKINR', parseFloat(e.target.value) || 0)} className="h-8 w-[100px] p-1 text-right ml-auto border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none font-medium" />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground bg-muted/30">{actKSEK.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">
                          <span className={utilized > 100 ? "text-red-500 font-semibold" : utilized > 80 ? "text-amber-500 font-medium" : "text-emerald-600 font-medium"}>
                            {utilized.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{contribution.toFixed(1)}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          <Input value={item.remarks} onChange={(e) => handleUpdateLineItem(item.id, 'remarks', e.target.value)} className="h-8 min-w-[150px] p-1 border-transparent hover:border-input focus-visible:border-input bg-transparent shadow-none" />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteLineItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
               <Upload className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
               <h3 className="text-lg font-medium">No Budget Data</h3>
               <p className="text-muted-foreground mt-1 max-w-sm">Upload an Excel file or add items manually to start tracking budget.</p>
               <div className="flex items-center gap-2 mt-4">
                 <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" /> Download Template
                 </Button>
                 <Button onClick={handleAddLineItem}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item Manually
                 </Button>
               </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

