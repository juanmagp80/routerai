'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface LearningStats {
    total_models_used: number;
    total_usage_count: number;
    favorite_model: string;
    average_rating: number;
    most_common_task_type: string;
    learning_confidence: number;
}

interface ModelRecommendation {
    model_name: string;
    provider: string;
    score: number;
    usage_count: number;
    average_rating: number;
    success_rate: number;
    task_affinity: number;
}

interface UsageTrend {
    model_name: string;
    provider: string;
    usage_count: number;
    user_rating_sum: number;
    user_rating_count: number;
    success_rate: number;
    task_types: Record<string, number>;
    last_used_at: string;
}

interface RecentFeedback {
    id: string;
    model_name: string;
    provider: string;
    rating: number;
    feedback_text: string;
    task_type: string;
    created_at: string;
}

export default function AdaptiveLearningPage() {
    const { user, isLoaded } = useUser();
    const [data, setData] = useState<{
        stats: LearningStats;
        recommendations: ModelRecommendation[];
        recentFeedback: RecentFeedback[];
        usageTrends: UsageTrend[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchLearningData();
        }
    }, [isLoaded, user]);

    const fetchLearningData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching learning data...');
            const response = await fetch('/api/admin/learning-stats');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', response.status, errorData);
                throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Learning data received:', result);
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('❌ Fetch error:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario está cargado
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    // Verificar si el usuario existe
    if (!user) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-700">Please sign in to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading adaptive learning data...</p>
                    <p className="text-sm text-gray-500 mt-2">User: {user.emailAddresses[0]?.emailAddress}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <p className="text-red-700">Error: {error}</p>
                        <Button onClick={fetchLearningData} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">No learning data available yet.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Start using the AI router to build your learning profile!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { stats, recommendations, recentFeedback, usageTrends } = data;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Adaptive Learning</h1>
                <Button onClick={fetchLearningData} variant="outline">
                    Refresh Data
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Models Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats?.total_models_used || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {stats?.total_usage_count || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">
                            {stats?.average_rating ? `${stats.average_rating.toFixed(1)}/5` : 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Learning Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-purple-600">
                            {stats?.learning_confidence ? `${(stats.learning_confidence * 100).toFixed(0)}%` : '0%'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Favorite Model</p>
                            <p className="font-semibold text-lg">
                                {stats?.favorite_model || 'None yet'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Most Common Task Type</p>
                            <Badge variant="outline" className="mt-1">
                                {stats?.most_common_task_type || 'None'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recommendations?.slice(0, 3).map((rec, index) => (
                                <div key={rec.model_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{rec.model_name}</p>
                                        <p className="text-sm text-gray-600">
                                            Score: {rec.score?.toFixed(2)} | Used: {rec.usage_count} times
                                        </p>
                                    </div>
                                    <Badge variant={index === 0 ? "default" : "secondary"}>
                                        #{index + 1}
                                    </Badge>
                                </div>
                            ))}
                            {(!recommendations || recommendations.length === 0) && (
                                <p className="text-sm text-gray-500 italic">
                                    No recommendations yet. Use the system more to get personalized suggestions!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {usageTrends?.map((trend) => (
                            <div key={trend.model_name} className="border-l-4 border-blue-500 pl-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{trend.model_name}</h4>
                                    <div className="flex space-x-2">
                                        <Badge variant="outline">{trend.provider}</Badge>
                                        <Badge variant="secondary">{trend.usage_count} uses</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Rating:</span>{' '}
                                        {trend.user_rating_count > 0
                                            ? `${(trend.user_rating_sum / trend.user_rating_count).toFixed(1)}/5`
                                            : 'No ratings'
                                        }
                                    </div>
                                    <div>
                                        <span className="font-medium">Success Rate:</span>{' '}
                                        {(trend.success_rate * 100).toFixed(1)}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Used:</span>{' '}
                                        {new Date(trend.last_used_at).toLocaleDateString()}
                                    </div>
                                </div>
                                {trend.task_types && Object.keys(trend.task_types).length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {Object.entries(trend.task_types).map(([type, count]) => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {type}: {count}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!usageTrends || usageTrends.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                                No usage data yet. Start using different models to see trends!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentFeedback?.map((feedback) => (
                            <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{feedback.model_name}</Badge>
                                        <div className="text-yellow-400">
                                            {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(feedback.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {feedback.feedback_text && (
                                    <p className="text-sm text-gray-700 italic">
                                        &ldquo;{feedback.feedback_text}&rdquo;
                                    </p>
                                )}
                                {feedback.task_type && (
                                    <Badge variant="secondary" className="text-xs mt-2">
                                        {feedback.task_type}
                                    </Badge>
                                )}
                            </div>
                        ))}
                        {(!recentFeedback || recentFeedback.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                                No feedback yet. Rate some responses to see them here!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}