package com.harmoniChat.app_hc.api.v1.controllers.family;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/family")
public class FamilyController {

    private final UserService userService;

    public FamilyController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{familyId}/members")
    public ResponseEntity<List<FamilyMemberResponse>> getFamilyMembers(@PathVariable Family familyId) {
        List<User> familyMembers = userService.findByFamilyId(familyId);

        List<FamilyMemberResponse> response = familyMembers.stream()
                .map(user -> new FamilyMemberResponse(
                        user.getId().toString(),
                        user.getFirstName(),
                        user.getLastName()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    public record FamilyMemberResponse(
            String id,
            String firstName,
            String lastName
    ) {}
}