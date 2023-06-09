deploy-anvil :;
	@export FOUNDRY_PROFILE=deploy && \
	forge script script/Deploy.s.sol:DeployScript -f http://127.0.0.1:8545/ --broadcast --delay 20 --retries 10 -vvvv && \
	export FOUNDRY_PROFILE=default