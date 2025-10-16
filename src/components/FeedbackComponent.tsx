'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface FeedbackComponentProps {
    usageRecordId: string;
    modelName: string;
    provider: string;
    taskContext?: {
        type: string;
        complexity: string;
        messageLength: number;
    };
    onFeedbackSubmitted?: () => void;
}

export function FeedbackComponent({
    usageRecordId,
    modelName,
    provider,
    taskContext,
    onFeedbackSubmitted
}: FeedbackComponentProps) {
    const [rating, setRating] = useState<number>(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [categories, setCategories] = useState<Record<string, boolean>>({
        accuracy: false,
        speed: false,
        cost: false,
        helpfulness: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleStarClick = (star: number) => {
        setRating(star);
    };

    const handleCategoryToggle = (category: string) => {
        setCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/adaptive-learning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usageRecordId,
                    modelName,
                    provider,
                    rating,
                    feedbackText: feedbackText.trim() || undefined,
                    categories,
                    taskContext
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                onFeedbackSubmitted?.();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="p-4 bg-green-50 border-green-200">
                <div className="text-center">
                    <div className="text-green-600 font-medium mb-2">
                        ✅ Thank you for your feedback!
                    </div>
                    <p className="text-sm text-green-700">
                        Your rating helps improve model selection for future requests.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rate this response</h4>
                    <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{modelName}</Badge>
                        <span className="text-sm text-gray-500">({provider})</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleStarClick(star)}
                                className={`text-2xl transition-colors ${star <= rating
                                        ? 'text-yellow-400 hover:text-yellow-500'
                                        : 'text-gray-300 hover:text-gray-400'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    )}
                </div>

                {/* Category Selection */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        What did you like about this response? (optional)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(categories).map(([category, selected]) => (
                            <Button
                                key={category}
                                variant={selected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCategoryToggle(category)}
                                className="text-xs"
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Feedback Text */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Additional feedback (optional)
                    </label>
                    <Textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us more about your experience..."
                        className="resize-none"
                        rows={3}
                    />
                </div>

                {/* Task Context Info */}
                {taskContext && (
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        <strong>Context:</strong> {taskContext.type} task, {taskContext.complexity} complexity
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </div>
        </Card>
    );
}