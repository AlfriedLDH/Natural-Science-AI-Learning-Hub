import React from 'react';
import { FEATURES, FeatureID } from '../../constants';

interface FeatureHeaderProps {
    featureId: FeatureID;
}

const FeatureHeader: React.FC<FeatureHeaderProps> = ({ featureId }) => {
    const feature = FEATURES[featureId];
    return (
        <div className="mb-8 pb-4 border-b-2 border-[var(--border-color)]">
            <div className="flex items-center mb-2">
                <div className="w-12 h-12 mr-4 bg-[var(--bg-secondary)] flex items-center justify-center"
                     style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}>
                    <feature.icon className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-3xl font-bold uppercase tracking-widest text-[var(--accent-primary)]">{feature.name}</h2>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
        </div>
    );
};

export default FeatureHeader;