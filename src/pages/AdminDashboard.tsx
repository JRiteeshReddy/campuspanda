import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Download, 
  UploadCloud, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  LogOut, 
  Clock, 
  FileCode, 
  Layers, 
  Hash, 
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface Release {
  version_code: number;
  version_name: string;
  release_notes: string;
  mandatory: boolean;
  download_url: string;
  published_at: string;
  downloads_count: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [loadingRelease, setLoadingRelease] = useState(true);
  
  // Form States
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [apkFile, setApkFile] = useState<File | null>(null);
  
  // Upload States
  const [publishing, setPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  // Retrieve JWT Admin Token
  const getAdminToken = () => {
    return localStorage.getItem('cp_admin_token') || '';
  };

  // Construct URL for the Edge Function endpoints
  const getAdminApiUrl = (endpoint: string) => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://asegblxpnduuagqincnj.supabase.co';
    return `${baseUrl}/functions/v1/${endpoint}`;
  };

  // Fetch Current Release Info
  const fetchCurrentRelease = async () => {
    setLoadingRelease(true);
    try {
      const token = getAdminToken();
      const response = await fetch(getAdminApiUrl('admin-api/release'), {
        method: 'GET',
        headers: {
          'x-admin-token': token,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Session expired or unauthorized.');
          handleLogout();
          return;
        }
        throw new Error('Failed to fetch release metadata.');
      }

      const data = await response.json();
      if (data && data.release) {
        setCurrentRelease(data.release);
      } else {
        setCurrentRelease(null);
      }
    } catch (err: any) {
      console.error('Fetch release error:', err);
      toast.error('Could not load current release info.');
    } finally {
      setLoadingRelease(false);
    }
  };

  useEffect(() => {
    fetchCurrentRelease();
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('cp_admin_token');
    toast.success('Logged out successfully.');
    navigate('/admin', { replace: true });
  };

  // File Validation & Handling
  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Invalid file format. Only Android APK (.apk) files are allowed.');
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 50MB limit.');
      return;
    }

    setApkFile(file);
    toast.success(`Selected file: ${file.name}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setApkFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Custom XMLHttpRequest uploader to track progress in real-time
  const uploadRelease = (formData: FormData, token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', getAdminApiUrl('admin-api/publish'));
      xhr.setRequestHeader('x-admin-token', token);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentage);
        }
      };

      xhr.onload = () => {
        let responseBody;
        try {
          responseBody = JSON.parse(xhr.responseText);
        } catch (_) {
          responseBody = { error: 'Failed to parse response body from server.' };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseBody);
        } else {
          reject(new Error(responseBody.error || `Publish failed with status code ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network communication error. Check your connection.'));
      };

      xhr.send(formData);
    });
  };

  // Publish Form Submit
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName || !versionCode || !releaseNotes || !apkFile) {
      toast.error('All form fields and an APK file are required.');
      return;
    }

    const vCodeNum = parseInt(versionCode);
    if (isNaN(vCodeNum) || vCodeNum <= 0) {
      toast.error('Version Code must be a positive integer.');
      return;
    }

    if (currentRelease && vCodeNum <= currentRelease.version_code) {
      toast.error(`Version Code must be greater than current active Version Code (${currentRelease.version_code}).`);
      return;
    }

    setPublishing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('apk', apkFile);
      formData.append('versionName', versionName.trim());
      formData.append('versionCode', vCodeNum.toString());
      formData.append('releaseNotes', releaseNotes.trim());
      formData.append('mandatory', mandatory.toString());

      const token = getAdminToken();
      const result = await uploadRelease(formData, token);

      if (result.success) {
        toast.success('New version published successfully!');
        // Reset form
        setVersionName('');
        setVersionCode('');
        setReleaseNotes('');
        setMandatory(false);
        setApkFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Refresh Current Release
        fetchCurrentRelease();
      } else {
        throw new Error(result.error || 'Failed to publish.');
      }
    } catch (err: any) {
      console.error('Publish submit error:', err);
      toast.error(err.message || 'Error occurred while publishing the new version.');
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateString;
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full h-16 px-6 sm:px-8 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md z-50 sticky top-0 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/259a2ad1-1ce7-481c-bdf3-3df888799e9d.png" alt="CampusPanda Logo" className="h-10 w-auto object-contain" />
          <span className="text-white/40">|</span>
          <span className="font-bold text-sm sm:text-base tracking-wide uppercase text-indigo-400">Admin Control</span>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-white/70 hover:text-white hover:bg-white/10 gap-2 text-xs sm:text-sm"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-white/60">
            Publish updates, manage release notes, and check the status of your Android application.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Current Release Details */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-white/5 border-white/10 text-white overflow-hidden shadow-xl">
              <CardHeader className="bg-white/5 border-b border-white/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                  <Layers size={18} />
                  Current Active Release
                </CardTitle>
                <CardDescription className="text-white/40">
                  Currently served update information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {loadingRelease ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    <span className="text-sm text-white/50">Fetching release metadata...</span>
                  </div>
                ) : currentRelease ? (
                  <div className="space-y-6">
                    {/* Pulsing Status indicator */}
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-semibold text-green-400">Active & Serving</span>
                      </div>
                      <span className="text-xs text-white/40">v{currentRelease.version_name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-white/40 mb-1 flex items-center gap-1">
                          <FileCode size={12} />
                          Version Name
                        </div>
                        <div className="text-lg font-bold">{currentRelease.version_name}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-white/40 mb-1 flex items-center gap-1">
                          <Hash size={12} />
                          Version Code
                        </div>
                        <div className="text-lg font-bold">{currentRelease.version_code}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-white/40 flex items-center gap-1">
                        <Clock size={12} />
                        Publish Date
                      </div>
                      <div className="text-sm font-medium">{formatDate(currentRelease.published_at)}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-white/40 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Downloads
                      </div>
                      {/* Using downloads_count, fallback to placeholder if not tracked */}
                      <div className="text-sm font-medium text-white/80">
                        {currentRelease.downloads_count !== undefined ? `${currentRelease.downloads_count} downloads` : '142 downloads (placeholder)'}
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1.5">
                      <div className="text-xs text-white/40 font-semibold uppercase">Update Requirement</div>
                      <div className="flex items-center gap-2">
                        {currentRelease.mandatory ? (
                          <>
                            <AlertTriangle size={16} className="text-amber-500 animate-bounce" />
                            <span className="text-sm text-amber-500 font-semibold">Mandatory Force Update</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-sm text-white/70">Optional Update</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-white/40 font-semibold uppercase">Release Notes</div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-white/70 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                        {currentRelease.release_notes}
                      </div>
                    </div>

                    <Button 
                      asChild 
                      className="w-full bg-white/10 hover:bg-white/15 text-white gap-2 transition-colors border border-white/10"
                    >
                      <a href={currentRelease.download_url} target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                        Download APK File
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-4 bg-white/5 rounded-full text-white/30">
                      <Layers size={40} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white/80">No release info found</h3>
                      <p className="text-xs text-white/40 max-w-xs mx-auto">
                        No APK has been published yet. Use the form to release the first version.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Publish New Version Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/5 border-white/10 text-white shadow-xl">
              <CardHeader className="bg-white/5 border-b border-white/10 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                  <UploadCloud size={18} />
                  Publish New Version
                </CardTitle>
                <CardDescription className="text-white/40">
                  Upload APK and metadata. Previous APK is replaced only after successful upload.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <form onSubmit={handlePublish} className="space-y-6">
                  {/* File Upload Drop Zone */}
                  <div className="space-y-2">
                    <Label className="text-sm text-white/80">APK File Upload</Label>
                    
                    {!apkFile ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full min-h-[160px] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all duration-300 ${
                          isDragActive 
                            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]' 
                            : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <UploadCloud size={32} className={`transition-colors duration-300 ${isDragActive ? 'text-indigo-400' : 'text-white/40'}`} />
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium">Drag & drop your APK file here or <span className="text-indigo-400 underline">browse</span></p>
                          <p className="text-xs text-white/40">Only Android APK files (.apk) up to 50MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".apk"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={publishing}
                        />
                      </div>
                    ) : (
                      <div className="w-full p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between animate-fade-in">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2.5 bg-indigo-500/15 rounded-lg text-indigo-400 shrink-0">
                            <Layers size={22} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-white">{apkFile.name}</p>
                            <p className="text-xs text-white/40">{formatBytes(apkFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={removeSelectedFile}
                          className="text-white/60 hover:text-red-400 hover:bg-red-500/10 shrink-0 p-2"
                          disabled={publishing}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Version Name */}
                    <div className="space-y-2">
                      <Label htmlFor="versionName" className="text-white/80">Version Name</Label>
                      <Input
                        id="versionName"
                        type="text"
                        placeholder="e.g. 1.3.0"
                        value={versionName}
                        onChange={(e) => setVersionName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        disabled={publishing}
                        required
                      />
                    </div>

                    {/* Version Code */}
                    <div className="space-y-2">
                      <Label htmlFor="versionCode" className="text-white/80">Version Code (integer)</Label>
                      <Input
                        id="versionCode"
                        type="number"
                        placeholder="e.g. 7"
                        value={versionCode}
                        onChange={(e) => setVersionCode(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        disabled={publishing}
                        required
                      />
                    </div>
                  </div>

                  {/* Release Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="releaseNotes" className="text-white/80">Release Notes (Markdown/Multiline)</Label>
                    <Textarea
                      id="releaseNotes"
                      placeholder="List changes, enhancements and bug fixes in this version..."
                      value={releaseNotes}
                      onChange={(e) => setReleaseNotes(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px] leading-relaxed"
                      disabled={publishing}
                      required
                    />
                  </div>

                  {/* Mandatory Update Toggle */}
                  <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/5 rounded-lg">
                    <Switch
                      id="mandatory"
                      checked={mandatory}
                      onCheckedChange={(checked) => setMandatory(checked)}
                      disabled={publishing}
                      className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-white/10"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="mandatory" className="text-sm font-semibold text-white/90">Force Mandatory Update</Label>
                      <p className="text-xs text-white/40">If enabled, Android app will require users to download the update before proceeding.</p>
                    </div>
                  </div>

                  {/* Progress bar displaying when uploading */}
                  {publishing && (
                    <div className="space-y-2 border border-white/5 p-4 rounded-lg bg-white/5 animate-fade-in">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-indigo-400 flex items-center gap-1.5">
                          <Loader2 size={12} className="animate-spin" />
                          {uploadProgress < 100 
                            ? `Uploading APK File: ${uploadProgress}%` 
                            : 'Deploying APK and updating version.json...'}
                        </span>
                        <span className="text-white/60">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5 bg-white/10">
                        <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </Progress>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    disabled={publishing}
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading & Publishing...
                      </>
                    ) : (
                      'Publish New Version'
                    )}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-white/5 mt-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-white/40">
          CampusPanda Website Admin Portal &copy; 2026. Developed By J Riteesh Reddy
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
