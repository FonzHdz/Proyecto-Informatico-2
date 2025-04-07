package com.harmoniChat.app_hc.entities_repositories_and_services.reaction;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionRepository reactionRepository;

    public List<Reaction> getAllReactions() {
        return reactionRepository.findAll();
    }

    public Optional<Reaction> getReactionById(UUID id) {
        return reactionRepository.findById(id);
    }

    public Reaction createReaction(Reaction reaction) {
        return reactionRepository.save(reaction);
    }
}
