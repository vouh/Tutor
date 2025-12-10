import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  DollarSign, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  FileText,
  Upload,
  X,
  Menu,
  LogOut,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <DollarSign size={20} /> },
    { id: 'content', label: 'Content', icon: <FileText size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const stats = [
    { label: 'Total Revenue', value: 'KES 245,890', change: '+12.5%', icon: <DollarSign className="h-5 w-5" />, color: 'bg-green-500' },
    { label: 'Active Users', value: '2,847', change: '+8.2%', icon: <Users className="h-5 w-5" />, color: 'bg-blue-500' },
    { label: 'Total Courses', value: '48', change: '+3', icon: <BookOpen className="h-5 w-5" />, color: 'bg-purple-500' },
    { label: 'This Month', value: 'KES 45,231', change: '+20.1%', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-orange-500' },
  ];

  const recentTransactions = [
    { id: 'TXN001', user: 'John Kamau', course: 'ChatGPT Mastery', amount: 2500, status: 'completed', date: '2024-01-15' },
    { id: 'TXN002', user: 'Mary Wanjiku', course: 'Python Basics', amount: 3000, status: 'completed', date: '2024-01-15' },
    { id: 'TXN003', user: 'Peter Ochieng', course: 'Mental Health', amount: 1500, status: 'pending', date: '2024-01-14' },
    { id: 'TXN004', user: 'Grace Muthoni', course: 'Personal Finance', amount: 2500, status: 'completed', date: '2024-01-14' },
    { id: 'TXN005', user: 'David Kiprop', course: 'Graphic Design', amount: 2000, status: 'failed', date: '2024-01-13' },
  ];

  const courses = [
    { id: 1, title: 'ChatGPT & AI Mastery', category: 'AI & Tech', price: 2500, students: 1250, status: 'active' },
    { id: 2, title: 'Python for Beginners', category: 'Coding', price: 3000, students: 980, status: 'active' },
    { id: 3, title: 'Managing Anxiety', category: 'Mental Health', price: 1500, students: 856, status: 'active' },
    { id: 4, title: 'Personal Finance Mastery', category: 'Finance', price: 2500, students: 1100, status: 'draft' },
    { id: 5, title: 'Graphic Design Fundamentals', category: 'Creative', price: 2000, students: 650, status: 'active' },
  ];

  const users = [
    { id: 1, name: 'John Kamau', email: 'john@email.com', courses: 3, spent: 7500, joined: '2024-01-10' },
    { id: 2, name: 'Mary Wanjiku', email: 'mary@email.com', courses: 2, spent: 4500, joined: '2024-01-08' },
    { id: 3, name: 'Peter Ochieng', email: 'peter@email.com', courses: 1, spent: 1500, joined: '2024-01-12' },
    { id: 4, name: 'Grace Muthoni', email: 'grace@email.com', courses: 4, spent: 9000, joined: '2024-01-05' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest M-Pesa payments received</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                  <TableCell>{txn.user}</TableCell>
                  <TableCell>{txn.course}</TableCell>
                  <TableCell>KES {txn.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Courses</h2>
          <p className="text-muted-foreground">Add, edit, or remove courses</p>
        </div>
        <Button onClick={() => setShowAddCourse(true)} className="gap-2">
          <Plus size={18} />
          Add New Course
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>KES {course.price.toLocaleString()}</TableCell>
                  <TableCell>{course.students.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {course.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon"><Eye size={16} /></Button>
                      <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500"><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCourse(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Course</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddCourse(false)}>
                  <X size={20} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Course Title</label>
                  <Input placeholder="e.g., ChatGPT Mastery" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select className="w-full border rounded-lg p-2">
                    <option>AI & Tech</option>
                    <option>Coding</option>
                    <option>Mental Health</option>
                    <option>Relationships</option>
                    <option>Personal Dev</option>
                    <option>Finance</option>
                    <option>Creative</option>
                    <option>Health & Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea placeholder="Course description..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (KES)</label>
                    <Input type="number" placeholder="2500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration</label>
                    <Input placeholder="e.g., 6 weeks" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Course Thumbnail</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Course Content (PDF/Video)</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <FileText className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-sm text-muted-foreground">Upload PDF or Video files</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button className="flex-1">Save as Draft</Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Publish Course</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <p className="text-muted-foreground">View and manage registered users</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.courses}</TableCell>
                  <TableCell>KES {user.spent.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon"><Eye size={16} /></Button>
                      <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">All Transactions</h2>
        <p className="text-muted-foreground">M-Pesa payment history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                  <TableCell>{txn.user}</TableCell>
                  <TableCell>{txn.course}</TableCell>
                  <TableCell>KES {txn.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Management</h2>
        <p className="text-muted-foreground">Upload and manage course materials</p>
      </div>
      <Card className="p-8 text-center">
        <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-lg font-semibold mb-2">Upload Content</h3>
        <p className="text-muted-foreground mb-4">Drag and drop PDF or video files here</p>
        <Button>Browse Files</Button>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your admin preferences</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>M-Pesa Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Consumer Key</label>
            <Input type="password" value="••••••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Consumer Secret</label>
            <Input type="password" value="••••••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Shortcode</label>
            <Input value="174379" />
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h1 className="font-bold text-xl">Tutor Admin</h1>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-card border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="font-medium">Admin</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
