
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCodeGenerator from './QRCodeGenerator';
import { Upload, Download, Users, BarChart3 } from 'lucide-react';

const AdminPanel = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const currentUrl = window.location.origin;

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
      
      // Clear existing dummy data
      await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Process CSV data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const employee = {
          employee_id: values[0],
          first_name: values[1],
          last_name: values[2],
          email: values[3],
          ideas: values[4] || '',
          selected_idea: values[5] || ''
        };
        
        if (employee.employee_id && employee.first_name && employee.last_name) {
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
    const csvContent = "employee_id,first_name,last_name,email,ideas,selected_idea\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">KaoTech Day-2025 Voting Platform Administration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <QRCodeGenerator 
              url={currentUrl} 
              title="Voting Platform QR Code" 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Share this QR code with employees to access the voting platform instantly.
                  The platform is fully responsive and works on all devices.
                </p>
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
                  <Label htmlFor="csvFile">CSV File (employee_id, first_name, last_name, email, ideas, selected_idea)</Label>
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
                  Upload a CSV file with employee data. This will replace existing dummy data.
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
                  <p><strong>Step 2:</strong> Ensure columns match the template</p>
                  <p><strong>Step 3:</strong> Upload using the form above</p>
                  <p className="text-gray-600 mt-4">
                    For Zoho API integration, we'll need your Zoho credentials and API endpoints.
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
