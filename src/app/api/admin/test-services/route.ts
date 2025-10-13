import { NextResponse } from 'next/server';
import { PlanLimitsService } from '@/lib/plan-limits-service';
import { ApiKeyService } from '@/lib/api-key-service';

export async function GET() {
  try {
    const realUserId = 'user_1760127156921_zttx2u9r0'; // ID real del usuario juangpdev@gmail.com
    
    // Probar getUserLimitsAndUsage
    const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(realUserId);
    
    // Probar getApiKeysByUserId
    const apiKeys = await ApiKeyService.getApiKeysByUserId(realUserId);
    
    return NextResponse.json({
      success: true,
      userId: realUserId,
      limitsAndUsage,
      apiKeys,
      apiKeyCount: apiKeys.length
    });
  } catch (error) {
    console.error('Error testing services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}