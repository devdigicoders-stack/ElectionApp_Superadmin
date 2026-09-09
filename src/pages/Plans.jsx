import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Power, Eye, UserPlus, X, AlertCircle, 
  CheckCircle2, IndianRupee, Layers
} from 'lucide-react';

const mockPlans = [
  {
    id: 'p1',
    name: 'Basic (Free)',
    price: 0,
    cycle: 'Monthly',
    features: ['Up to 5 Users', 'Basic Analytics', 'Standard Support'],
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Pro',
    price: 4999,
    cycle: 'Monthly',
    features: ['Unlimited Users', 'Advanced Analytics', 'Priority Support', 'Custom Domain'],
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Premium',
    price: 49999,
    cycle: 'Yearly',
    features: ['Everything in Pro', 'White-labeling', 'Dedicated Account Manager'],
    isActive: false,
  }
];

const mockTenants = [
  { id: 't1', name: 'Amit Sharma' },
  { id: 't2', name: 'Priya Singh' },
  { id: 't3', name: 'Ravi Kumar' }
];

export default function Plans() {
  const [plans, setPlans] = useState(mockPlans);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, plan: null });

  const openModal = (type, plan = null) => {
    setModalConfig({ isOpen: true, type, plan });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, plan: null });
  };

  const handleToggleActive = (planId) => {
    setPlans(plans.map(p => p.id === planId ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="p-4 sm:p-8 w-full">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing packages, features, and plan assignments.</p>
        </div>
        <button 
          onClick={() => openModal('ADD')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </button>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl border ${plan.isActive ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-gray-200'} shadow-sm p-6 flex flex-col hover:shadow-md transition-all relative overflow-hidden group`}>
            
            {/* Active Badge */}
            {plan.isActive && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
                ACTIVE
              </div>
            )}
            {!plan.isActive && (
              <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
                DISABLED
              </div>
            )}

            <div className="mb-4 pr-12">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{plan.name}</h3>
              <div className="text-xs text-gray-400 mt-1 font-mono">ID: {plan.id}</div>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">₹{plan.price.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-500 ml-1">/ {plan.cycle}</span>
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Included Features</p>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600 gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => openModal('VIEW', plan)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => openModal('EDIT', plan)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit Plan">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => openModal('ASSIGN', plan)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Assign Plan">
                  <UserPlus className="w-4 h-4" />
                </button>
                <button onClick={() => openModal('DELETE', plan)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Plan">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => handleToggleActive(plan.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${plan.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                title={plan.isActive ? 'Disable Plan' : 'Enable Plan'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${plan.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No plans found</h3>
            <p className="text-sm text-gray-500">Create your first subscription plan to get started.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {modalConfig.type === 'ADD' && <><Plus className="w-5 h-5 text-emerald-600" /> Create Plan</>}
                {modalConfig.type === 'EDIT' && <><Edit className="w-5 h-5 text-emerald-600" /> Edit Plan</>}
                {modalConfig.type === 'VIEW' && <><Eye className="w-5 h-5 text-blue-600" /> Plan Details</>}
                {modalConfig.type === 'ASSIGN' && <><UserPlus className="w-5 h-5 text-purple-600" /> Assign Plan</>}
                {modalConfig.type === 'DELETE' && <><AlertCircle className="w-5 h-5 text-red-600" /> Delete Plan</>}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              
              {/* ADD / EDIT Form */}
              {(modalConfig.type === 'ADD' || modalConfig.type === 'EDIT') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name</label>
                    <input type="text" defaultValue={modalConfig.plan?.name || ''} placeholder="e.g. Pro Package" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                      <input type="number" defaultValue={modalConfig.plan?.price || ''} placeholder="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Billing Cycle</label>
                      <select defaultValue={modalConfig.plan?.cycle || 'Monthly'} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm bg-white">
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Included Features</label>
                    <textarea rows="3" defaultValue={modalConfig.plan?.features?.join('\n') || ''} placeholder="One feature per line..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"></textarea>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isActive" defaultChecked={modalConfig.plan ? modalConfig.plan.isActive : true} className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Status</label>
                  </div>
                </div>
              )}

              {/* VIEW Details */}
              {modalConfig.type === 'VIEW' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{modalConfig.plan?.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> 
                        <span className="font-semibold text-gray-700 mr-1">{modalConfig.plan?.price.toLocaleString()}</span> 
                        / {modalConfig.plan?.cycle}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${modalConfig.plan?.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {modalConfig.plan?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 mb-2">Features Included</h5>
                    <ul className="space-y-2">
                      {modalConfig.plan?.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ASSIGN Plan */}
              {modalConfig.type === 'ASSIGN' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm mb-4 border border-purple-100">
                    Assigning <span className="font-bold">"{modalConfig.plan?.name}"</span> to a client will override their current subscription.
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select Client (Tenant)</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm bg-white">
                      <option value="">-- Choose a client --</option>
                      {mockTenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* DELETE Confirmation */}
              {modalConfig.type === 'DELETE' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Plan</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete the <span className="font-bold text-gray-800">"{modalConfig.plan?.name}"</span> plan? This action cannot be undone and may affect active subscribers.
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {modalConfig.type === 'DELETE' ? (
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                >
                  Delete Plan
                </button>
              ) : modalConfig.type === 'VIEW' ? (
                <button 
                  onClick={() => openModal('EDIT', modalConfig.plan)}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Edit Plan
                </button>
              ) : modalConfig.type === 'ASSIGN' ? (
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                >
                  Assign Plan
                </button>
              ) : (
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Plan
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
