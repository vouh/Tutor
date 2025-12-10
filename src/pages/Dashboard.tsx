import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Award, LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                    JK
                  </div>
                  <div>
                    <h3 className="font-semibold">John Kamau</h3>
                    <p className="text-xs text-muted-foreground">Student</p>
                  </div>
                </div>
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" /> My Courses
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Clock className="w-4 h-4 mr-2" /> History
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Award className="w-4 h-4 mr-2" /> Certificates
                  </Button>
                  <div className="pt-4 mt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" size="sm">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Learning</h1>
              <p className="text-muted-foreground">Welcome back! Continue where you left off.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course Card */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-40 bg-gray-200 relative overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">KCSE Mathematics Revision Masterclass</h3>
                  <div className="w-full bg-secondary/20 h-2 rounded-full mb-2">
                    <div className="bg-primary h-full rounded-full w-[45%]" />
                  </div>
                  <p className="text-xs text-muted-foreground">45% Complete</p>
                </CardContent>
              </Card>

              {/* Empty State Placeholder */}
              <Card className="border-dashed flex items-center justify-center min-h-[250px] bg-muted/30">
                <div className="text-center p-6">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Find more courses</h3>
                  <Button variant="outline">Browse Catalog</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
