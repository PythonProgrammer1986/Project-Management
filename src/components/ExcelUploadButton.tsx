import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useWorkspace } from '../store';
import { Priority, Status } from '../types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function ExcelUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTask, activeProjectId } = useWorkspace();

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Title: 'Example Task',
        Description: 'Detailed instructions here',
        Status: 'To Do',
        Priority: 'High',
        'Start Date': '2023-11-01',
        'Due Date': '2023-12-01'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Task_Upload_Template.xlsx');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeProjectId) {
      toast.error('No active project selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.warning('Uploaded file is empty.');
          return;
        }

        for (const row of data as any[]) {
          const title = row.Title || row.title || row.Name || row.name;
          if (!title) continue;

          let startDate = '';
          const rawStart = row['Start Date'] || row.startDate || row.start_date;
          if (rawStart) {
            startDate = !isNaN(Number(rawStart)) ? new Date((Number(rawStart) - (25567 + 2)) * 86400 * 1000).toISOString() : new Date(rawStart).toISOString();
          }

          let dueDate = '';
          const rawDue = row['Due Date'] || row.dueDate || row.due_date;
          if (rawDue) {
            dueDate = !isNaN(Number(rawDue)) ? new Date((Number(rawDue) - (25567 + 2)) * 86400 * 1000).toISOString() : new Date(rawDue).toISOString();
          }

          await addTask({
            projectId: activeProjectId,
            title: title.toString(),
            description: row.Description || row.description || '',
            status: (row.Status || row.status || 'To Do') as Status,
            priority: (row.Priority || row.priority || 'Medium') as Priority,
            assigneeId: '',
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
          });
        }
        
        toast.success(`Successfully imported ${data.length} tasks!`);
      } catch (err) {
        console.error('Error parsing Excel', err);
        toast.error('Failed to parse Excel file. Check date formats.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        hidden 
        ref={fileInputRef} 
        onChange={handleUpload}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Upload className="mr-2 h-3.5 w-3.5" />
            Excel
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
            Upload Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4 text-muted-foreground" />
            Download Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
