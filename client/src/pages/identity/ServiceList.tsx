import { useEffect, useState } from 'react';
import { Plus, CreditCard, Trash2, Edit2, Calendar, Link as LinkIcon } from 'lucide-react';
import { api, Service, Email } from '../../api';
import { ServiceForm } from '../../components/identity/ServiceForm';

export const ServiceList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | undefined>(undefined);

    const fetchData = async () => {
        try {
            const [servicesData, emailsData] = await Promise.all([
                api.services.list(),
                api.emails.list()
            ]);
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

    const handleCreate = async (data: Omit<Service, 'id'>) => {
        try {
            await api.services.create(data);
            await fetchData();
        } catch (error) {
            console.error('Failed to create service:', error);
        }
    };

    const handleUpdate = async (data: Omit<Service, 'id'>) => {
        if (!editingService) return;
        try {
            await api.services.update(editingService.id, data);
            await fetchData();
            setEditingService(undefined);
        } catch (error) {
            console.error('Failed to update service:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.services.delete(id);
            await fetchData();
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
    };

    const openCreateModal = () => {
        setEditingService(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const getEmailLabel = (id: string) => {
        const email = emails.find(e => e.id === id);
        return email ? email.label : 'Unknown Email';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'cancelled': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            case 'trial': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'past_due': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400';
        }
    };

    const calculateTotalMonthlyCost = () => {
        return services.reduce((total, service) => {
            if (service.status !== 'active' && service.status !== 'trial') return total;
            const cost = service.cost?.amount || 0;
            if (service.billingCycle === 'monthly') return total + cost;
            if (service.billingCycle === 'yearly') return total + (cost / 12);
            return total;
        }, 0);
    };

    if (isLoading) {
        return <div className="text-slate-400 p-8 text-center">Loading services...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Services & Subscriptions</h2>
                    <p className="text-slate-400">Track recurring costs and account access.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Monthly Cost</div>
                    <div className="text-3xl font-bold text-emerald-400">
                        ${calculateTotalMonthlyCost().toFixed(2)}
                        <span className="text-sm text-slate-500 font-normal ml-1">/mo (est)</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Active Services</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {services.filter(s => s.status === 'active').length}
                    </div>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Trialing</div>
                    <div className="text-3xl font-bold text-amber-400">
                        {services.filter(s => s.status === 'trial').length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                    <div key={service.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors group relative flex flex-col">
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(service)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-start mb-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 mr-3 shrink-0">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white truncate pr-6">{service.name}</h3>
                                <div className="text-sm text-slate-400">{service.category}</div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Linked to:</span>
                                <span className="text-slate-300 truncate max-w-[150px]" title={getEmailLabel(service.emailId)}>
                                    {getEmailLabel(service.emailId)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Cost:</span>
                                <span className="text-slate-200 font-mono">
                                    {service.cost ? `${service.cost.currency} ${service.cost.amount}` : '-'}
                                    <span className="text-slate-500 text-xs ml-1">/{service.billingCycle}</span>
                                </span>
                            </div>
                            {service.renewalDate && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Renews:</span>
                                    <span className="text-slate-300 flex items-center">
                                        <Calendar size={12} className="mr-1 text-slate-500" />
                                        {new Date(service.renewalDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between mt-auto">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getStatusColor(service.status)}`}>
                                {service.status.replace('_', ' ')}
                            </span>

                            {service.loginUrl && (
                                <a
                                    href={service.loginUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                                >
                                    Login <LinkIcon size={10} className="ml-1" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-400">No services tracked</h3>
                        <p className="text-slate-500 text-sm mt-1">Add your subscriptions to see cost analysis.</p>
                    </div>
                )}
            </div>

            <ServiceForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingService ? handleUpdate : handleCreate}
                initialData={editingService}
                emails={emails}
            />
        </div>
    );
};
