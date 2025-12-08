import { useEffect, useState } from 'react';
import { api, Project, Service, Identity } from '../../api';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { BackButton } from '../../components/BackButton';
import { Search, Plus, MoreHorizontal, Folder, Trash2 } from 'lucide-react';
import { ProjectForm } from '../../components/identity/ProjectForm';

export const ProjectsList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [projectsData, servicesData, identitiesData] = await Promise.all([
                api.projects.list(),
                api.services.list(),
                api.identities.list()
            ]);
            setProjects(projectsData);
            setServices(servicesData);
            setIdentities(identitiesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsFormOpen(true);
    };

    const handleDelete = async (project: Project) => {
        if (!project.id) return;
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await api.projects.delete(project.id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    const handleFormSubmit = async () => {
        setIsFormOpen(false);
        fetchData();
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <BackButton to="/" label="Back to Dashboard" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
                    <p className="text-jarvis-muted">Manage your software initiatives.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-muted" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9 h-9 text-sm bg-jarvis-card/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setSelectedProject(undefined); setIsFormOpen(true); }}
                        icon={<Plus className="w-4 h-4" />}
                        className="shrink-0"
                    >
                        New Project
                    </Button>
                </div>
            </div>

            <div className="bg-jarvis-card/50 backdrop-blur-sm border border-jarvis-border/50 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-jarvis-border/50 text-xs font-medium text-jarvis-muted uppercase tracking-wider bg-white/5">
                    <div className="col-span-4">Project</div>
                    <div className="col-span-4">Stack / Services</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-jarvis-border/30">
                    {isLoading ? (
                        <div className="p-8 text-center text-jarvis-muted">Loading projects...</div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="p-8 text-center text-jarvis-muted">No projects found.</div>
                    ) : (
                        filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors duration-200"
                            >
                                {/* Name & Description */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-jarvis-bg/50 border border-jarvis-border flex items-center justify-center text-jarvis-accent group-hover:text-white transition-colors">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-jarvis-accent transition-colors">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-xs text-jarvis-muted truncate max-w-[200px]">{project.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Stack & Services (Simplified) */}
                                <div className="col-span-4">
                                    <div className="flex flex-wrap gap-1">
                                        {/* Placeholder for tech stack if we had it, or connected services count */}
                                        {project.serviceIds && project.serviceIds.length > 0 ? (
                                            <Badge variant="outline" className="text-[10px] bg-jarvis-bg/30">
                                                {project.serviceIds.length} Services
                                            </Badge>
                                        ) : (
                                            <span className="text-jarvis-muted text-xs">-</span>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-3">
                                    <Badge variant={project.status === 'active' ? 'success' : 'outline'} className="text-[10px] capitalize">
                                        {project.status}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} className="h-8 w-8 text-jarvis-muted hover:text-white">
                                        <MoreHorizontal className="w-4 h-4" /> {/* Or Edit2 */}
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project)} className="h-8 w-8 text-jarvis-muted hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isFormOpen && (
                <ProjectForm
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormOpen(false)}
                    initialData={selectedProject}
                    services={services}
                    identities={identities}
                />
            )}
        </div>
    );
};
