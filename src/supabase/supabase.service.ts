import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './supabase.config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const config = this.configService.get<SupabaseConfig>('supabase');

      // Initialize the regular client (with anon key)
      this.supabase = createClient(config.url, config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        // Add global error handler
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                'x-custom-header': 'custom-value', // Add any custom headers
              },
            });
          },
        },
      });

      // Initialize admin client (with service role key)
      this.adminClient = createClient(config.url, config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      this.logger.log('Supabase clients initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase clients', error);
      throw error;
    }
  }

  /**
   * Get the admin Supabase client (with service role key)
   * Use this for database operations
   */
  getClient(): SupabaseClient {
    if (!this.adminClient) {
      throw new Error('Supabase admin client not initialized');
    }
    return this.adminClient;
  }

  /**
   * Get the regular Supabase client (with anon key)
   * Use this for auth operations
   */
  getAuthClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }

  /**
   * Helper method to handle Supabase errors consistently
   */
  handleError(error: any, context: string): never {
    this.logger.error(`Supabase error in ${context}:`, error);
    throw error;
  }
}
