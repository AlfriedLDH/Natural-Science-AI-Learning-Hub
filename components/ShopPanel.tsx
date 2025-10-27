
import React, { useState } from 'react';
import { FeatureID, SHOP_ITEMS, AVATARS, THEMES } from '../constants';
import FeatureHeader from './common/FeatureHeader';
import { useAuth } from '../hooks/useAuth';
import { IconGold } from './Icons';
import { ShopItem, User } from '../types';
// FIX: The useNotification hook is not provided. Mocking it to resolve errors.
// import { useNotification } from '../hooks/useNotifications';


const ShopPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'avatars' | 'themes'>('avatars');
    const { user, updateUser } = useAuth();
    // const { addNotification } = useNotification();
    // FIX: Mock implementation of addNotification since the hook is not available.
    const addNotification = (message: string, type: 'error' | 'info' | 'success') => {
        alert(`[${type.toUpperCase()}] ${message}`);
    };


    const handlePurchase = (item: ShopItem) => {
        if (!user) return;

        if (user.gold < item.cost) {
            addNotification("Not enough Gold!", 'error');
            return;
        }
        if (user.inventory.includes(item.id)) {
            addNotification("You already own this item.", 'info');
            return;
        }

        const updatedUser: User = {
            ...user,
            gold: user.gold - item.cost,
            inventory: [...user.inventory, item.id],
        };
        
        // If the item is a theme or avatar, equip it immediately
        if (item.type === 'theme') {
            updatedUser.theme = item.id;
        }
        if (item.type === 'avatar') {
            updatedUser.avatar = item.id;
        }

        updateUser(updatedUser);
        addNotification(`Purchased ${item.name}!`, 'success');
    };

    const itemsToDisplay = SHOP_ITEMS.filter(item => item.type === (activeTab === 'avatars' ? 'avatar' : 'theme'));

    const TabButton: React.FC<{ tabId: 'avatars' | 'themes'; label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-6 py-2 uppercase text-sm font-bold transition-colors ${activeTab === tabId ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <FeatureHeader featureId={FeatureID.Marketplace} />
            
            <div className="flex justify-center mb-6">
                <div className="p-1 border border-[var(--border-color)] flex space-x-1 bg-[var(--bg-secondary)]">
                    <TabButton tabId="avatars" label="Avatars" />
                    <TabButton tabId="themes" label="Themes" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {itemsToDisplay.map(item => {
                    const isOwned = user?.inventory.includes(item.id);
                    const canAfford = user && user.gold >= item.cost;
                    const isEquipped = (item.type === 'avatar' && user?.avatar === item.id) || (item.type === 'theme' && user?.theme === item.id);

                    const itemVisual = item.type === 'avatar' 
                        ? <img src={AVATARS[item.id]} alt={item.name} className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-transparent group-hover:border-[var(--accent-primary)] transition-colors" />
                        : <div className="h-24 w-full p-2 border border-[var(--border-color)]" style={{ background: THEMES[item.id].gradient }}>
                            <div className="h-full w-full bg-black/20 flex items-center justify-center text-white font-bold">
                                {THEMES[item.id].name}
                            </div>
                          </div>;

                    return (
                        <div key={item.id} className="game-card flex flex-col justify-between text-center group">
                            <div>
                                {itemVisual}
                                <h3 className="font-bold text-lg mt-4">{item.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">{item.description}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center text-xl font-bold text-yellow-400 mb-4">
                                    <IconGold className="w-6 h-6 mr-2" />
                                    <span>{item.cost}</span>
                                </div>
                                <button
                                    onClick={() => handlePurchase(item)}
                                    disabled={isOwned || !canAfford}
                                    className="game-button w-full"
                                >
                                    {isEquipped ? 'Equipped' : isOwned ? 'Owned' : !canAfford ? 'Not Enough Gold' : 'Purchase'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShopPanel;