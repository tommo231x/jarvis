import { useEffect, useState } from 'react';
import { Plus, Folder, Trash2, Edit2, Shield, Calendar, CreditCard, Layers } from 'lucide-react';
import { api, Project, Service, Email } from '../../api';
import { ProjectForm } from '../../components/identity/ProjectForm';

export const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

    const fetchData = async () => {
        try {
            const [projectsData, servicesData, emailsData] = await Promise.all([
                api.projects.list(),
                api.services.list(),
                api.emails.list()
            ]);
            setProjects(projectsData);
            setServices(servicesData);
            setEmails(emailsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (data: Omit<Project, 'id'>) => {
        try {
            await api.projects.create(data);
            await fetchData();
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const handleUpdate = async (data: Omit<Project, 'id'>) => {
        if (!editingProject) return;
        try {
            await api.projects.update(editingProject.id, data);
            await fetchData();
            setEditingProject(undefined);
        } catch (error) {
            console.error('Failed to update project:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.projects.delete(id);
            await fetchData();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const openCreateModal = () => {
        setEditingProject(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const getPrimaryEmailLabel = (id?: string) => {
        if (!id) return 'None';
        const email = emails.find(e => e.id === id);
        return email ? email.label : 'Unknown';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'planning': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'completed': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'archived': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-400';
        }
    };

    const calculateProjectCost = (project: Project) => {
        return project.serviceIds.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            if (!service || !service.cost) return total;

            const cost = service.cost.amount;
            if (service.billingCycle === 'monthly') return total + cost;
            if (service.billingCycle === 'yearly') return total + (cost / 12);
            return total;
        }, 0);
    };

    if (isLoading) {
        return <div className="text-slate-400 p-8 text-center">Loading projects...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Projects</h2>
                    <p className="text-slate-400">Contextual workspaces for your digital assets.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <div key={project.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group relative flex flex-col">
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(project)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start mb-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 mr-3 shrink-0">
                                <Folder size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white truncate pr-6">{project.name}</h3>
                                <div className="text-sm text-slate-400 truncate max-w-[200px]">{project.description || 'No description'}</div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center"><Shield size={12} className="mr-1.5" /> Identity</span>
                                <span className="text-slate-300">{getPrimaryEmailLabel(project.primaryEmailId)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center"><Layers size={12} className="mr-1.5" /> Services</span>
                                <span className="text-slate-300">{project.serviceIds.length} Linked</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center"><CreditCard size={12} className="mr-1.5" /> Monthly Cost</span>
                                <span className="text-emerald-400 font-mono">${calculateProjectCost(project).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between mt-auto">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                            {project.startDate && (
                                <span className="text-xs text-slate-500 flex items-center">
                                    <Calendar size={10} className="mr-1" />
                                    {new Date(project.startDate).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Folder size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-400">No projects yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Create a project to group your services.</p>
                    </div>
                )}
            </div>

            <ProjectForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingProject ? handleUpdate : handleCreate}
                initialData={editingProject}
                emails={emails}
                services={services}
            />
        </div>
    );
};
