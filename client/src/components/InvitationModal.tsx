
import React, { useState } from 'react';
import { X, Package, Users, Settings, Send } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator?: {
    id: number;
    username: string;
    displayName?: string;
    followerCount: number;
  };
}

const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, creator }) => {
  const [step, setStep] = useState(1);
  const [invitationData, setInvitationData] = useState({
    message: '',
    contentType: 'no-preference',
    products: [],
    commissionRate: 5,
    freeSeeSamples: 'manual-review'
  });

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const contentTypes = [
    { value: 'no-preference', label: 'No preference' },
    { value: 'shoppable-video', label: 'Shoppable video' },
    { value: 'shoppable-live', label: 'Shoppable LIVE' }
  ];

  const sampleProducts = [
    {
      id: 1,
      name: 'Car Holder - 15W Fast Wireless Charging, Adjustable Viewing Angles, Secure and Stable Mount',
      price: '£19.99',
      stock: 30,
      image: '🚗'
    },
    {
      id: 2,
      name: 'Joyroom S-Y104 Charge & Music 2 in 1 Dual Lightning Audio Splitter Connector Adapter',
      price: '£9.99',
      stock: 100,
      image: '🔌'
    },
    {
      id: 3,
      name: 'Super Fast 100000mAh charging power bank with LED Display Black',
      price: '£35.99',
      stock: 56,
      image: '🔋'
    },
    {
      id: 4,
      name: 'Joyroom 35W Mini Phone charger head, with intelligent dual-port PD',
      price: '£18.47',
      stock: 100,
      image: '⚡'
    },
    {
      id: 5,
      name: '40W JR-MW02 1 Wireless Waterproof Speaker with RGB Lights Audio Metal',
      price: '£72.00',
      stock: 33,
      image: '🔊'
    }
  ];

  if (!isOpen) return null;

  const sendInvitation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          creatorId: creator?.id,
          ...invitationData,
          products: selectedProducts
        })
      });
      
      if (response.ok) {
        alert('Invitation sent successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create Target Invitation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Form */}
          <div className="space-y-6">
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={invitationData.message}
                onChange={(e) => setInvitationData({...invitationData, message: e.target.value})}
                placeholder={`Hi ${creator?.displayName || creator?.username}!\n\nWe'd love for you to promote our top-selling power bank. It went viral on our main account @digi4u and it has been super popular since then. you probably already came across it!\n\nThis is a fantastic opportunity to get more exposure with the new are then out there as it we'll definitely be!`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred content type</label>
              <p className="text-xs text-gray-500 mb-2">
                Let creators know if you have a preference between shoppable videos or LIVE sessions. Creators can post any content type to earn target post commission.
              </p>
              <select
                value={invitationData.contentType}
                onChange={(e) => setInvitationData({...invitationData, contentType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Choose Products */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">2</div>
                <h3 className="font-medium">Choose products</h3>
                <span className="text-xs text-gray-500">No products selected</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {sampleProducts.map(product => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedProducts.some(p => p.id === product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <div className="text-2xl">{product.image}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{product.price}</span>
                        <span>Stock: {product.stock}</span>
                        <span className="text-green-600">Eligible</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={invitationData.commissionRate}
                onChange={(e) => setInvitationData({...invitationData, commissionRate: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Free Samples */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Set up free samples</label>
              <select
                value={invitationData.freeSeeSamples}
                onChange={(e) => setInvitationData({...invitationData, freeSeeSamples: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="manual-review">Manually review requests</option>
                <option value="auto-approve">Auto-approve all requests</option>
                <option value="no-samples">No free samples</option>
              </select>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-4">Preview</h3>
            <div className="bg-red-800 text-white rounded-lg p-4 text-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  D4
                </div>
                <div>
                  <div className="font-medium">Digi4u Repair's invite</div>
                  <div className="text-xs opacity-75">REPLY ONLY</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs opacity-75 mb-1">Overview</div>
                <div className="text-xs">Products: {selectedProducts.length}</div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs opacity-75 mb-1">About this shop</div>
                <div className="text-xs">Digi4u Repair</div>
                <div className="text-xs opacity-75">UK • Electronics & Hardware</div>
              </div>
              
              <div className="bg-black bg-opacity-20 rounded p-2 text-xs">
                <div className="opacity-75 mb-1">Message</div>
                <div className="line-clamp-3">
                  {invitationData.message || "We'd love to collaborate with you on promoting our products..."}
                </div>
              </div>
              
              <div className="mt-3 text-xs opacity-75">
                <div>Preferred content type:</div>
                <div>{contentTypes.find(t => t.value === invitationData.contentType)?.label}</div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">
                  Decline
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Selected creator: @{creator?.username} ({creator?.followerCount.toLocaleString()} followers)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Discard
            </button>
            <button
              onClick={sendInvitation}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;
