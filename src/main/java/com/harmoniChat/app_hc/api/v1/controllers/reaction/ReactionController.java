package com.harmoniChat.app_hc.api.v1.controllers.reaction;

import com.harmoniChat.app_hc.entities_repositories_and_services.reaction.Reaction;
import com.harmoniChat.app_hc.entities_repositories_and_services.reaction.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/reactions")
@RequiredArgsConstructor
public class ReactionController {
    private final ReactionService reactionService;

    @GetMapping
    public ResponseEntity<List<Reaction>> getAllReactions() {
        List<Reaction> reactions = reactionService.getAllReactions();
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reaction> getReactionById(@PathVariable UUID id) {
        Optional<Reaction> reaction = reactionService.getReactionById(id);
        return reaction.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Reaction> createReaction(@RequestBody Reaction reaction) {
        Reaction savedReaction = reactionService.createReaction(reaction);
        return ResponseEntity.ok(savedReaction);
    }
}
