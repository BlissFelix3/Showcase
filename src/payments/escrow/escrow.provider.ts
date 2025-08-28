export interface EscrowProvider {
  createEscrow(
    caseId: string,
    amountMinor: number,
    metadata?: {
      milestoneId?: string;
      purpose?: string;
      lawyerId?: string;
      clientId?: string;
    },
  ): Promise<{ escrowId: string; status: string }>;

  releaseEscrow(
    escrowId: string,
    amountMinor?: number,
  ): Promise<{ released: boolean; transactionId?: string }>;

  getEscrowStatus(escrowId: string): Promise<{
    status: string;
    amountMinor: number;
    metadata?: Record<string, unknown>;
  }>;

  cancelEscrow(escrowId: string): Promise<{ cancelled: boolean }>;

  getEscrowBalance(
    escrowId: string,
  ): Promise<{ balanceMinor: number; currency: string }>;
}

export class DummyEscrowProvider implements EscrowProvider {
  private escrows = new Map<
    string,
    {
      caseId: string;
      amountMinor: number;
      status: string;
      metadata?: Record<string, unknown>;
      createdAt: Date;
      balanceMinor: number;
    }
  >();

  async createEscrow(
    caseId: string,
    amountMinor: number,
    metadata?: {
      milestoneId?: string;
      purpose?: string;
      lawyerId?: string;
      clientId?: string;
    },
  ): Promise<{ escrowId: string; status: string }> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    const escrowId = `escrow_${caseId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.escrows.set(escrowId, {
      caseId,
      amountMinor,
      status: 'ACTIVE',
      metadata,
      createdAt: new Date(),
      balanceMinor: amountMinor,
    });

    return { escrowId, status: 'ACTIVE' };
  }

  async releaseEscrow(
    escrowId: string,
    amountMinor?: number,
  ): Promise<{ released: boolean; transactionId?: string }> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'ACTIVE') {
      throw new Error('Escrow is not in active state');
    }

    const releaseAmount = amountMinor || escrow.balanceMinor;

    if (releaseAmount > escrow.balanceMinor) {
      throw new Error('Release amount exceeds escrow balance');
    }

    // Update balance
    escrow.balanceMinor -= releaseAmount;

    if (escrow.balanceMinor === 0) {
      escrow.status = 'RELEASED';
    }

    const transactionId = `txn_${escrowId}_${Date.now()}`;

    return { released: true, transactionId };
  }

  async getEscrowStatus(escrowId: string): Promise<{
    status: string;
    amountMinor: number;
    metadata?: Record<string, unknown>;
  }> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    return {
      status: escrow.status,
      amountMinor: escrow.amountMinor,
      metadata: escrow.metadata,
    };
  }

  async cancelEscrow(escrowId: string): Promise<{ cancelled: boolean }> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'ACTIVE') {
      throw new Error('Escrow cannot be cancelled in current state');
    }

    escrow.status = 'CANCELLED';

    return { cancelled: true };
  }

  async getEscrowBalance(
    escrowId: string,
  ): Promise<{ balanceMinor: number; currency: string }> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    return {
      balanceMinor: escrow.balanceMinor,
      currency: 'NGN',
    };
  }
}

// Real escrow provider implementation (for production)
export class RealEscrowProvider implements EscrowProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createEscrow(
    caseId: string,
    amountMinor: number,
    metadata?: {
      milestoneId?: string;
      purpose?: string;
      lawyerId?: string;
      clientId?: string;
    },
  ): Promise<{ escrowId: string; status: string }> {
    // TODO: Implement real escrow provider API calls
    // This would integrate with services like Flutterwave, Paystack Business, or other escrow providers
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation

    // Log parameters for debugging (remove in production)
    console.log(
      `Creating escrow for case: ${caseId}, amount: ${amountMinor}, metadata:`,
      metadata,
    );

    throw new Error('Real escrow provider not implemented yet');
  }

  async releaseEscrow(
    escrowId: string,
    amountMinor?: number,
  ): Promise<{ released: boolean; transactionId?: string }> {
    // TODO: Implement real escrow release
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation

    // Log parameters for debugging (remove in production)
    console.log(`Releasing escrow: ${escrowId}, amount: ${amountMinor}`);

    throw new Error('Real escrow provider not implemented yet');
  }

  async getEscrowStatus(escrowId: string): Promise<{
    status: string;
    amountMinor: number;
    metadata?: Record<string, unknown>;
  }> {
    // TODO: Implement real escrow status check
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation

    // Log parameters for debugging (remove in production)
    console.log(`Getting escrow status: ${escrowId}`);

    throw new Error('Real escrow provider not implemented yet');
  }

  async cancelEscrow(escrowId: string): Promise<{ cancelled: boolean }> {
    // TODO: Implement real escrow cancellation
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation

    // Log parameters for debugging (remove in production)
    console.log(`Cancelling escrow: ${escrowId}`);

    throw new Error('Real escrow provider not implemented yet');
  }

  async getEscrowBalance(
    escrowId: string,
  ): Promise<{ balanceMinor: number; currency: string }> {
    // TODO: Implement real escrow balance check
    await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation

    // Log parameters for debugging (remove in production)
    console.log(`Getting escrow balance: ${escrowId}`);

    throw new Error('Real escrow provider not implemented yet');
  }
}
