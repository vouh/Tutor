import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, PlayCircle, FileText, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CourseDetail = () => {
  const { id } = useParams();

  // Mock data - fetch from Supabase later
  const course = {
    title: "KCSE Mathematics Revision Masterclass",
    price: 500,
    description: "Complete revision guide for KCSE Mathematics. Covers Algebra, Calculus, Geometry and more with step-by-step video solutions.",
    instructor: "Mr. David Kamau",
    lessons: 12,
    duration: "5 Hours",
    level: "High School",
    features: [
      "Full Syllabus Coverage",
      "Past Paper Solutions",
      "Downloadable PDF Notes",
      "24/7 Tutor Support"
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-primary/5 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {course.level}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-montserrat">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center"><PlayCircle className="w-4 h-4 mr-2" /> {course.lessons} Lessons</span>
                <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> {course.duration}</span>
                <span>By {course.instructor}</span>
              </div>
            </div>
            
            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl border-primary/10 overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <PlayCircle className="w-16 h-16 opacity-50" />
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="text-3xl font-bold text-primary">
                    KES {course.price}
                  </div>
                  <Button className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Buy Now with M-Pesa
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Instant access after payment
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curriculum" className="space-y-4">
                {[1, 2, 3, 4, 5].map((lesson) => (
                  <div key={lesson} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <PlayCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Lesson {lesson}: Introduction to Algebra</h4>
                        <p className="text-sm text-muted-foreground">15 mins</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="overview">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
