import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCodeGenerator from './QRCodeGenerator';
import { Upload, Download, Users, BarChart3, LogOut, Globe } from 'lucide-react';

interface AdminPanelProps {
  onSignOut: () => void;
}

const AdminPanel = ({ onSignOut }: AdminPanelProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const { toast } = useToast();
  
  // Use custom domain if provided, otherwise fall back to current origin
  const targetUrl = customDomain || window.location.origin;

  const handleFileUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Clear existing data
      await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Process CSV data mapping to new structure
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Map Excel columns to database columns
        const employee = {
          excel_id: values[0] || null, // id
          start_time: values[1] ? new Date(values[1]).toISOString() : null, // Start time
          completion_time: values[2] ? new Date(values[2]).toISOString() : null, // Completion time
          email: values[3] || null, // Email
          name: values[4] || '', // Name
          last_modified_time: values[5] ? new Date(values[5]).toISOString() : null, // Last modified time
          name2: values[6] || null, // Name2
          employee_id: values[7] || '', // Employee ID
          hackathon_participation: values[8] || null, // Would you be interested in participating in the upcoming Hackathon?
          idea1_title: values[9] || null, // Idea-1 Title
          problem1: values[10] || null, // Problem-1
          solution1: values[11] || null, // Solution-1
          roi1: values[12] || null, // Return on investment (ROI)-1
          idea2_title: values[13] || null, // Idea-2 Title
          problem2: values[14] || null, // Problem-2
          solution2: values[15] || null, // Solution-2
          roi2: values[16] || null, // Return on investment (ROI)-2
          idea3_title: values[17] || null, // Idea-3 Title
          problem3: values[18] || null, // Problem-3
          solution3: values[19] || null, // Solution-3
          roi3: values[20] || null, // Return on investment (ROI)-3
          architectural_diagram: values[21] || null, // Architectural Diagram/ Process Flow Diagram
          selected_idea: values[22] || null, // Selected Idea
          group_name: values[23] || null, // Group
        };
        
        if (employee.employee_id && employee.name) {
          await supabase.from('employees').insert(employee);
        }
      }
      
      toast({
        title: "Success!",
        description: "Employee data uploaded successfully",
      });
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Error uploading CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "id,Start time,Completion time,Email,Name,Last modified time,Name2,Employee ID,Would you be interested in participating in the upcoming Hackathon?,Idea-1 Title,Problem-1,Solution-1,Return on investment (ROI)-1,Idea-2 Title,Problem-2,Solution-2,Return on investment (ROI)-2,Idea-3 Title,Problem-3,Solution-3,Return on investment (ROI)-3,Architectural Diagram/ Process Flow Diagram,Selected Idea,Group\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminUser');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">KaoTech Day-2025 Voting Platform Administration</p>
          </div>
          <Button onClick={onSignOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Custom Domain Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customDomain">Custom Domain (optional)</Label>
                  <Input
                    id="customDomain"
                    type="url"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="https://yourdomain.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your hosting domain to generate QR code for production
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <QRCodeGenerator 
              url={targetUrl} 
              title="Voting Platform QR Code" 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  QR Code Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Current URL:</strong> {targetUrl}</p>
                  <p className="text-gray-600">
                    Share this QR code with employees to access the voting platform. 
                    If you've set a custom domain above, the QR code will redirect to your production site.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Management Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Employee Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">CSV File (matching your Excel structure)</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleFileUpload}
                    disabled={!csvFile || uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                  
                  <Button 
                    onClick={downloadTemplate}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Template
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Upload a CSV file with your Excel data structure. This will replace existing data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Excel Integration Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Step 1:</strong> Export your Excel file as CSV</p>
                  <p><strong>Step 2:</strong> Ensure columns match the template exactly</p>
                  <p><strong>Step 3:</strong> Upload using the form above</p>
                  <p className="text-gray-600 mt-4">
                    The system now supports all 23+ columns from your Excel spreadsheet including multiple ideas, problems, solutions, and ROI data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
