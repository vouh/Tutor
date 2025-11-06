import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Video, BookOpen, Download } from 'lucide-react';

const Resources = () => {
  const resources = [
    {
      id: 1,
      title: 'KCSE Mathematics Past Papers',
      type: 'PDF',
      category: 'KCSE',
      downloads: 1250,
      icon: FileText,
      description: 'Complete collection of KCSE Mathematics past papers (2010-2024)'
    },
    {
      id: 2,
      title: 'English Grammar Video Series',
      type: 'Video',
      category: 'General',
      downloads: 890,
      icon: Video,
      description: 'Comprehensive video tutorials on English grammar and composition'
    },
    {
      id: 3,
      title: 'KCPE Science Study Guide',
      type: 'PDF',
      category: 'KCPE',
      downloads: 1100,
      icon: BookOpen,
      description: 'Complete study guide covering all KCPE Science topics'
    },
    {
      id: 4,
      title: 'Chemistry Practical Notes',
      type: 'PDF',
      category: 'KCSE',
      downloads: 750,
      icon: FileText,
      description: 'Detailed notes on chemistry practicals with diagrams'
    },
    {
      id: 5,
      title: 'Mathematics Formula Sheet',
      type: 'PDF',
      category: 'General',
      downloads: 2100,
      icon: FileText,
      description: 'Essential mathematical formulas for quick reference'
    },
    {
      id: 6,
      title: 'Biology Revision Videos',
      type: 'Video',
      category: 'KCSE',
      downloads: 680,
      icon: Video,
      description: 'Video lessons covering key biology concepts'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-montserrat text-5xl font-bold mb-6">Learning Resources</h1>
            <p className="font-open-sans text-xl max-w-3xl">
              Access study materials, past papers, and video tutorials to enhance your learning
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={resource.id}
                    className="bg-card rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="text-primary" size={28} />
                      </div>
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold">
                        {resource.category}
                      </span>
                    </div>
                    <h3 className="font-montserrat text-xl font-bold">{resource.title}</h3>
                    <p className="font-open-sans text-muted-foreground text-sm">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{resource.type}</span>
                      <div className="flex items-center space-x-1">
                        <Download size={16} />
                        <span>{resource.downloads} downloads</span>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-montserrat font-semibold hover:bg-accent transition-colors flex items-center justify-center space-x-2">
                      <Download size={18} />
                      <span>Download</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
