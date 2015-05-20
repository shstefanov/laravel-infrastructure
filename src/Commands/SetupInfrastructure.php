<?php namespace SHStefanov\Infrastructure\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class SetupInfrastructure extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'infrastructure:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup infrastructure-laravel integration';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function fire()
    {
        $this->info('Command infrastructure:setup');
    }

}
