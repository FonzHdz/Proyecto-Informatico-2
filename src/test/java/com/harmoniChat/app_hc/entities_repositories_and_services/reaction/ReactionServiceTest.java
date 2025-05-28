package com.harmoniChat.app_hc.entities_repositories_and_services.reaction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class ReactionServiceTest {

    @Mock
    private ReactionRepository reactionRepository;

    @InjectMocks
    private ReactionService reactionService;

    private Reaction reaction;

    @BeforeEach
    void setUp() {
        reaction = Reaction.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .postId(UUID.randomUUID())
                .content("❤️")
                .build();
    }

    @Test
    void testGetAllReactions() {
        when(reactionRepository.findAll()).thenReturn(List.of(reaction));

        List<Reaction> result = reactionService.getAllReactions();

        assertEquals(1, result.size());
        assertEquals("❤️", result.get(0).getContent());
        verify(reactionRepository).findAll();
    }

    @Test
    void testGetReactionById() {
        UUID id = reaction.getId();
        when(reactionRepository.findById(id)).thenReturn(Optional.of(reaction));

        Optional<Reaction> result = reactionService.getReactionById(id);

        assertTrue(result.isPresent());
        assertEquals("❤️", result.get().getContent());
        verify(reactionRepository).findById(id);
    }

    @Test
    void testCreateReaction() {
        when(reactionRepository.save(reaction)).thenReturn(reaction);

        Reaction result = reactionService.createReaction(reaction);

        assertNotNull(result);
        assertEquals(reaction.getContent(), result.getContent());
        verify(reactionRepository).save(reaction);
    }
}
